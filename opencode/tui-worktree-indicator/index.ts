import { Plugin } from "@opencode/plugin"
import { CopilotUsage } from "./rpc"

type UsageItem = { product?: string; grossQuantity?: number }

export default Plugin.define({
  id: "local.worktree-indicator",
  async setup(ctx) {
    await ctx.rpc.register(CopilotUsage, {
      monthly: async (_input, { signal }) => {
        try {
          const connection = await ctx.integration.connection.active("github-copilot")
          if (!connection) return { status: "unavailable", reason: "Copilot not connected" }
          const credential = await ctx.integration.connection.resolve(connection)
          if (!credential || credential.type !== "oauth" || !credential.access) {
            return { status: "unavailable", reason: "Copilot credential unavailable" }
          }

          const headers = {
            Authorization: `Bearer ${credential.access}`,
            Accept: "application/vnd.github+json",
            "X-GitHub-Api-Version": "2026-03-10",
          }
          const account = await fetch("https://api.github.com/user", { headers, signal })
          if (!account.ok) return { status: "unavailable", reason: `GitHub account HTTP ${account.status}` }
          const { login } = (await account.json()) as { login?: unknown }
          if (typeof login !== "string" || !login) return { status: "unavailable", reason: "GitHub username missing" }

          const now = new Date()
          const year = now.getUTCFullYear()
          const month = now.getUTCMonth() + 1
          const url = new URL(`https://api.github.com/users/${encodeURIComponent(login)}/settings/billing/ai_credit/usage`)
          url.searchParams.set("year", String(year))
          url.searchParams.set("month", String(month))
          const response = await fetch(url, { headers, signal })
          if (!response.ok) {
            // Organization-paid seats are absent from personal billing reports. This
            // Copilot quota endpoint is undocumented, so validate its shape strictly.
            if (response.status !== 403 && response.status !== 404) {
              return { status: "unavailable", reason: `GitHub billing HTTP ${response.status}` }
            }
            const internal = await fetch("https://api.github.com/copilot_internal/user", { headers, signal })
            if (!internal.ok) return { status: "unavailable", reason: `Copilot quota HTTP ${internal.status}` }
            const details = (await internal.json()) as { quota_snapshots?: Record<string, unknown> }
            const premium = details.quota_snapshots?.premium_interactions
            const fields = premium && typeof premium === "object" ? premium as Record<string, unknown> : {}
            if (fields.token_based_billing !== true || typeof fields.credits_used !== "number" ||
              !Number.isFinite(fields.credits_used) || fields.credits_used < 0) {
              return { status: "unavailable", reason: "AI credit quota unavailable" }
            }
            const allowance = fields.entitlement
            return {
              status: "ok",
              used: fields.credits_used,
              ...(typeof allowance === "number" && Number.isFinite(allowance) && allowance > 0
                ? { allowance } : {}),
              username: login,
              month: `${year}-${String(month).padStart(2, "0")}`,
            }
          }
          const report = (await response.json()) as { usageItems?: UsageItem[] }
          if (!Array.isArray(report.usageItems)) return { status: "unavailable", reason: "Invalid billing response" }

          // Gross quantity counts credits consumed, including credits covered by the plan.
          const items = report.usageItems.filter((item) => /copilot/i.test(item.product ?? ""))
          if (report.usageItems.length && !items.length) return { status: "unavailable", reason: "No Copilot usage items" }
          if (items.some((item) => typeof item.grossQuantity !== "number" || !Number.isFinite(item.grossQuantity))) {
            return { status: "unavailable", reason: "Invalid usage quantity" }
          }
          return {
            status: "ok",
            used: items.reduce((total, item) => total + item.grossQuantity!, 0),
            username: login,
            month: `${year}-${String(month).padStart(2, "0")}`,
          }
        } catch {
          return { status: "unavailable", reason: "GitHub request failed" }
        }
      },
    })
  },
})
