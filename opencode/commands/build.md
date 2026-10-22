---
description: Switch from plan to build mode and implement the agreed plan
agent: build
subagent: false
---

Implement the final agreed-upon plan from our current session.

Additional direction / scope: $ARGUMENTS

Execution rules:
1. **Final plan only**: Treat the latest agreed state of our plan as the source of truth, ignoring any earlier ideas that were revised or discarded during discussion.
2. **Reuse existing context**: You already explored the codebase in this session. Do not re-read files that are already in our conversation context unless you need to check lines that were not previously read.
3. **Strict scope**: Implement only what was agreed upon. Do not refactor unrelated code or add unrequested features.
4. **Follow project rules**: Adhere to all repository and product `AGENTS.md` instructions.
5. **Surface blockers early**: If an assumption from the plan fails during implementation, stop and ask via the `question` tool instead of silently improvising a different design.
6. **Verify**: Check diagnostics on modified files (and run only the verification allowed by `AGENTS.md` or agreed in the plan), then provide a concise summary of changes.
