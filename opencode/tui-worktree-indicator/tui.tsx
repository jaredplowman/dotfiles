import { Plugin, usePlugin } from "@opencode/plugin/tui"
import { createEffect, createSignal, onCleanup } from "solid-js"

function trim(path: string) {
  return path.replace(/[\\/]+$/, "")
}

function contains(root: string, directory: string) {
  const windows = root.includes("\\")
  const base = windows ? trim(root).toLowerCase() : trim(root)
  const current = windows ? directory.toLowerCase() : directory
  return current === base || current.startsWith(base + (windows ? "\\" : "/"))
}

function WorktreeIndicator(props: { sessionID: string }) {
  const context = usePlugin()
  const session = () => context.data.session.get(props.sessionID)
  const location = () => session()?.location ?? context.data.location.default()
  const directory = () => location().directory
  const [roots, setRoots] = createSignal<string[]>([])
  const root = () => {
    const canonical = context.data.project.get(session()?.projectID ?? "")?.canonical
    return [...roots(), ...(canonical ? [canonical] : [])]
      .filter((candidate) => contains(candidate, directory()))
      .sort((a, b) => b.length - a.length)[0] ?? directory()
  }
  const worktree = () => trim(root()).split(/[\\/]/).pop() ?? root()
  const workspace = () => {
    const project = context.data.project.get(session()?.projectID ?? "")
    return project?.name ?? project?.canonical.replace(/[\\/]+$/, "").split(/[\\/]/).pop() ?? "Workspace"
  }
  const branch = () => context.data.location.vcs.info(location())?.branch.current

  createEffect(() => {
    void context.data.location.vcs.sync(location())
  })
  createEffect(() => {
    const projectID = session()?.projectID
    if (!projectID) return
    let active = true
    setRoots([])
    void context.client.worktree.list({ projectID }).then(
      (response) => {
        if (active) setRoots((response.data ?? []).map((item) => item.directory))
      },
      () => {},
    )
    onCleanup(() => { active = false })
  })
  void context.data.project.sync()

  return (
    <box flexDirection="column" paddingLeft={1} paddingRight={1} paddingTop={1} paddingBottom={1}>
      <text fg={context.theme.text.muted}>WORKSPACE</text>
      <text fg={context.theme.text.base}>{workspace()}</text>
      <text fg={context.theme.text.muted}>WORKTREE</text>
      <text fg={context.theme.text.base}>{worktree()}{branch() ? `  (${branch()})` : ""}</text>
      <text fg={context.theme.text.muted}>{context.ui.format.path(root())}</text>
    </box>
  )
}

export default Plugin.define({
  id: "local.worktree-indicator",
  setup(context) {
    return context.ui.slot({
      prepend: "sidebar.content",
      render: ({ sessionID }) => <WorktreeIndicator sessionID={sessionID} />,
    })
  },
})
