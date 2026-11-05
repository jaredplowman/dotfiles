import { Rpc } from "@opencode/plugin/rpc"

export const CopilotUsage = Rpc.define({
  id: "local.worktree-indicator.copilot-usage",
  methods: {
    monthly: {
      input: { type: "object", properties: {}, additionalProperties: false },
      output: {
        type: "object",
        properties: {
          status: { type: "string", enum: ["ok", "unavailable"] },
          reason: { type: "string" },
          used: { type: "number" },
          allowance: { type: "number" },
          username: { type: "string" },
          month: { type: "string" },
        },
        required: ["status"],
        additionalProperties: false,
      },
    },
  },
  events: {},
})
