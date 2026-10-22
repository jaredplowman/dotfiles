---
name: changed-files
description: List all changed files in the Git repository (staged, unstaged, untracked, or compared against a branch/commit ref) without full diff contents. Use when the user asks to see changed, modified, or touched files.
compatibility: opencode
---

## Usage

- `@changed-files` — list all uncommitted changed files in the working tree (staged, unstaged, and untracked).
- `@changed-files <branch-or-ref>` — list all files changed between `<branch-or-ref>` and the current working tree (or `HEAD`).
- `@changed-files --stat` — include per-file line addition/deletion counts alongside the file list.

## Rules & Boundaries

- **Files only by default**: Output only the file paths and their change status (`Modified`, `Added`, `Deleted`, `Renamed`, `Untracked`). Do **not** dump full code diffs (`git diff` patch output) or read file contents unless the user explicitly asks to inspect the contents.
- **Read-only**: Never stage, modify, reset, or checkout files when running this skill.
- **Fast execution**: Batch Git status/diff queries into a single shell command.

## Workflow

1. **Verify repository**:
   - Confirm the current directory is inside a Git repository (`git rev-parse --show-toplevel`). If not, ask the user which repository directory to inspect.

2. **Collect changed files**:
   - **Default (Working tree changes — no target ref specified)**:
     Run a single command to gather staged, unstaged, and untracked files:
     ```powershell
     git status --short --branch --untracked-files=all
     ```
     *(If the user also requested line stats, run `git diff HEAD --stat` alongside it.)*
     If the working tree is clean (`git status --porcelain` is empty), check whether the current branch has commits ahead of its upstream or base branch and mention that the working tree has no uncommitted changes.

   - **When a target branch or ref is specified (`<ref>`)**:
     Verify `<ref>` exists (`git rev-parse --verify "<ref>^{commit}"`). Compare against the merge-base so only changes introduced on the current branch and working tree appear:
     ```powershell
     $base = git merge-base "<ref>" HEAD
     git diff --name-status $base
     git ls-files --others --exclude-standard
     ```
     *(If the user requested `--stat`, also run `git diff --stat $base`.)*

3. **Present the results clearly**:
   - Group or label the files clearly by status (for example: **Staged**, **Unstaged**, **Untracked**, or **Changed vs `<ref>`** with `[M]` Modified, `[A]` Added, `[D]` Deleted, `[R]` Renamed, `[?]` Untracked).
   - Provide a concise total file count at the end.
