---
description: Stage all changes and create a chore commit with title and body
agent: build
---

Stage all current changes and create a git commit.

Steps:
1. Run `git add -A` to stage all changes.
2. Run `git status` and `git diff --cached` to understand what changed.
3. Create ONE commit with `git commit -m "<subject>" -m "<body>"`.

The commit subject MUST:
- Start with `chore: `
- Be a concise, descriptive title of 120 characters or fewer.
- Describe the primary change concisely.

The commit body MUST:
- Be a short description of the change.
- Explain relevant implementation details or intent when useful.
- Have no character-count limit.

Do NOT push. Do NOT amend. If there are no changes to commit, say so and stop.

Extra instructions from the user (optional): $ARGUMENTS
