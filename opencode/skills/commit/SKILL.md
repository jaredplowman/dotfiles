---
name: commit
description: Commit current changes by choosing commit-fix, commit-feat, or commit-chore. Use when the user asks to commit changes; an explicit fix, feat, or chore overrides automatic selection.
compatibility: opencode
---

## Usage

- `@commit` — inspect the changes and choose a commit type automatically.
- `@commit fix` — force `commit-fix`.
- `@commit feat` — force `commit-feat`.
- `@commit chore` — force `commit-chore`.

Additional text supplies instructions for the commit, for example:
`@commit fix Focus the message on the login timeout.`

## Workflow

1. Determine whether the user explicitly requested `fix`, `feat`, or `chore`. Accept either a type immediately following `@commit` or a clear natural-language instruction such as "commit this as a chore." An explicit type takes precedence over automatic classification. Do not treat incidental mentions of these words as overrides. If the user gives conflicting types without a clear correction, ask which one to use.
2. Inspect the current repository with `git status --short`, `git diff`, and `git diff --cached`. Inspect relevant untracked file contents as well, since the selected workflow stages all changes. If there are no changes to commit, say so and stop. If the current directory is not in a Git repository, ask for the repository location.
3. When no explicit type was requested, classify the primary intent of the changes:
   - **fix**: correct broken or incorrect behavior, including regressions.
   - **feat**: add or expand functionality.
   - **chore**: maintenance, tooling, dependencies, documentation, tests, or behavior-preserving refactoring without a primary bug fix or feature.
   Classify by purpose rather than file type. Tests and documentation supporting a fix or feature belong to that primary intent. For mixed changes, choose the dominant intent; ask only when the intended type is genuinely ambiguous.
4. Briefly state the chosen type and why, or note that the user explicitly requested it.
5. Read the matching command file relative to this skill's directory:
   - **fix**: `../../commands/commit-fix.md`
   - **feat**: `../../commands/commit-feat.md`
   - **chore**: `../../commands/commit-chore.md`
6. Follow the selected command's workflow in the current session. These are command files, not skills; read their contents rather than calling the skill tool with their names. Treat `$ARGUMENTS` as the user's additional commit instructions, excluding the routing type. If the command file cannot be read, report the missing workflow and stop.
7. The existing commands stage all changes and create one commit with the selected prefix, a subject of at most 120 characters, and a short body. Follow their no-push and no-amend rules. Respect the active agent's permissions and mode; command frontmatter does not switch agents or grant permission to commit.
8. After a successful commit, report the commit hash and subject. If committing fails, report the failure without claiming success.
