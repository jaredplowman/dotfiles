import { TextAttributes } from "@opentui/core"
import { Plugin, usePlugin } from "@opencode/plugin/tui"
import { createEffect, createSignal, For, onCleanup, Show } from "solid-js"

type FileStatus = {
  file: string
  additions: number
  deletions: number
  status: "added" | "deleted" | "modified"
}

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
  const [status, setStatus] = createSignal<FileStatus[]>([])
  const [base, setBase] = createSignal<string | undefined>(undefined)

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

  const vcs = () => context.data.location.vcs.info(location())
  const branch = () => {
    const info = vcs()
    if (info?.branch?.current) return info.branch.current
    if (info?.provider) return "HEAD (detached)"
    return "none"
  }
  const rootBranch = () => {
    const current = vcs()?.branch?.current
    const detected = base() ?? vcs()?.branch?.default
    if (!detected || detected === current) return undefined
    return detected
  }

  const statusCounts = () => {
    const items = status()
    let modified = 0
    let added = 0
    let deleted = 0
    let additions = 0
    let deletions = 0
    for (const item of items) {
      if (item.status === "added") added++
      else if (item.status === "deleted") deleted++
      else modified++
      additions += item.additions ?? 0
      deletions += item.deletions ?? 0
    }
    const parts: string[] = []
    if (modified > 0) parts.push(`${modified} modified`)
    if (added > 0) parts.push(`${added} added`)
    if (deleted > 0) parts.push(`${deleted} deleted`)
    return {
      label: parts.join(", "),
      additions,
      deletions,
    }
  }

  const badge = (kind: FileStatus["status"]) => {
    if (kind === "added") return "A"
    if (kind === "deleted") return "D"
    return "M"
  }

  const badgeColor = (kind: FileStatus["status"]) => {
    if (kind === "added") return context.theme.text.feedback.success.base
    if (kind === "deleted") return context.theme.text.feedback.error.base
    return context.theme.text.feedback.warning.base
  }

  const fileName = (file: string) => trim(file).split(/[\\/]/).pop() ?? file

  createEffect(() => {
    const loc = location()
    let active = true

    const refreshVcs = () => {
      void context.data.location.vcs.sync(loc)
      void context.client.vcs.base({ location: loc }).then(
        (response) => {
          if (active) setBase(response.data?.name ?? undefined)
        },
        () => {
          if (active) setBase(undefined)
        },
      )
      void context.client.vcs.status({ location: loc }).then(
        (response) => {
          if (active) setStatus((response.data ?? []) as FileStatus[])
        },
        () => {
          if (active) setStatus([])
        },
      )
    }

    refreshVcs()

    const unsubscribe = context.data.listen(() => {
      refreshVcs()
    })

    onCleanup(() => {
      active = false
      unsubscribe()
    })
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
    <box flexDirection="column" gap={1}>
      <box flexDirection="column">
        <text fg={context.theme.text.base} attributes={TextAttributes.BOLD}>Workspace</text>
        <text fg={context.theme.text.muted}>{workspace()}</text>
      </box>
      <box flexDirection="column">
        <text fg={context.theme.text.base} attributes={TextAttributes.BOLD}>Worktree</text>
        <text fg={context.theme.text.muted}>{worktree()}</text>
        <text fg={context.theme.text.muted}>{context.ui.format.path(root())}</text>
      </box>
      <box flexDirection="column">
        <text fg={context.theme.text.base} attributes={TextAttributes.BOLD}>Branch</text>
        <text fg={context.theme.text.muted}>{branch()}</text>
        <Show when={rootBranch()}>
          {(from) => (
            <text fg={context.theme.text.muted}>
              {"from "}
              <span style={{ fg: context.theme.text.feedback.info.base }}>{from()}</span>
            </text>
          )}
        </Show>
      </box>
      <box flexDirection="column">
        <text fg={context.theme.text.base} attributes={TextAttributes.BOLD}>Git Status</text>
        <Show
          when={status().length > 0}
          fallback={<text fg={context.theme.text.muted}>Clean</text>}
        >
          <text fg={context.theme.text.muted}>
            {statusCounts().label}
            {" ("}
            <span style={{ fg: context.theme.text.feedback.success.base }}>{`+${statusCounts().additions}`}</span>
            {" "}
            <span style={{ fg: context.theme.text.feedback.error.base }}>{`-${statusCounts().deletions}`}</span>
            {")"}
          </text>
          <For each={status()}>
            {(item) => (
              <text fg={context.theme.text.muted}>
                <span style={{ fg: badgeColor(item.status) }}>{badge(item.status)}</span>
                {` ${fileName(item.file)} (`}
                <span style={{ fg: context.theme.text.feedback.success.base }}>{`+${item.additions}`}</span>
                {" "}
                <span style={{ fg: context.theme.text.feedback.error.base }}>{`-${item.deletions}`}</span>
                {")"}
              </text>
            )}
          </For>
        </Show>
      </box>
    </box>
  )
}

export default Plugin.define({
  id: "local.worktree-indicator",
  setup(context) {
    return context.ui.slot({
      append: "sidebar.content",
      render: ({ sessionID }) => <WorktreeIndicator sessionID={sessionID} />,
    })
  },
})
