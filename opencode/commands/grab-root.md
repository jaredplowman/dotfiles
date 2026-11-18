---
description: Grab uncommitted changes from the root worktree into this worktree (root is source of truth)
agent: build
model: github-copilot/gpt-6-luna
subagent: false
---

Load and follow the `grab-root` skill (use the skill tool with id: "grab-root") to pull the root worktree's changes into the current worktree. $ARGUMENTS
