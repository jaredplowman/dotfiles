import { TextAttributes } from "@opentui/core"
import { usePlugin } from "@opencode/plugin/tui"
import { createEffect, createSignal, onCleanup } from "solid-js"

type Request = {
  cost?: number
  model?: { providerID: string; id: string; variant?: string }
  tokens?: {
    input: number
    output: number
    reasoning: number
    cache: { read: number; write: number }
  }
}

function dollars(value: number) {
  return `$${value.toFixed(value < 0.01 && value !== 0 ? 4 : 2)}`
}

function count(value?: number) {
  return typeof value === "number" && Number.isFinite(value) ? value.toLocaleString() : "unknown"
}

export function LastModelCall(props: { sessionID: string }) {
  const context = usePlugin()
  const [request, setRequest] = createSignal<Request>()
  const [state, setState] = createSignal<"loading" | "ready" | "unavailable">("loading")

  createEffect(() => {
    const sessionID = props.sessionID
    let active = true
    let loading = false
    let pending = false

    const refresh = async (invalidate = false) => {
      if (loading) {
        pending = true
        return
      }
      loading = true
      do {
        pending = false
        try {
          if (invalidate) context.data.session.message.invalidate(sessionID)
          await context.data.session.message.sync(sessionID)
          if (!active) break
          const latest = (context.data.session.message.list(sessionID) ?? [])
            .filter((message) => message.type === "assistant" && message.time.completed !== undefined)
            .sort((a, b) => b.time.created - a.time.created)[0]
          setRequest(latest ? { cost: latest.cost, model: latest.model, tokens: latest.tokens } : undefined)
          setState("ready")
        } catch {
          if (active) setState("unavailable")
        }
        invalidate = true
      } while (pending && active)
      loading = false
    }

    setRequest(undefined)
    setState("loading")
    void refresh()
    const stopUsage = context.data.on("session.usage.updated", (event) => {
      if (event.data.sessionID === sessionID) void refresh(true)
    })
    const stopExecution = context.data.on("session.execution.succeeded", (event) => {
      if (event.data.sessionID === sessionID) void refresh(true)
    })
    onCleanup(() => {
      active = false
      stopUsage()
      stopExecution()
    })
  })

  const label = () => {
    if (state() === "loading") return "Loading…"
    if (state() === "unavailable") return "Usage unavailable"
    const latest = request()
    if (!latest) return "No completed calls yet"
    if (typeof latest.cost !== "number" || !Number.isFinite(latest.cost)) return "Cost: unknown"
    return dollars(latest.cost)
  }

  return (
    <box flexDirection="column">
      <text fg={context.theme.text.base} attributes={TextAttributes.BOLD}>Latest completed call</text>
      <text fg={context.theme.text.muted}>{label()}</text>
      {request() && state() === "ready" && (
        <>
          <text fg={context.theme.text.muted}>Model: {request()!.model?.id ?? "unknown"}{request()!.model?.variant ? ` (${request()!.model!.variant})` : ""}</text>
          <text fg={context.theme.text.muted}>Input: {count(request()!.tokens?.input)} · Output: {count(request()!.tokens?.output)}</text>
          <text fg={context.theme.text.muted}>Reasoning: {count(request()!.tokens?.reasoning)}</text>
          <text fg={context.theme.text.muted}>Cache read: {count(request()!.tokens?.cache?.read)}</text>
          <text fg={context.theme.text.muted}>Cache write: {count(request()!.tokens?.cache?.write)}</text>
        </>
      )}
    </box>
  )
}
