---
name: grab-root
description: Pull the uncommitted changes from the root (main) Git worktree into the current linked worktree, treating the root worktree as the source of truth. Warns and offers to abort when the change set is large. Use when asked to "grab root", "pull changes from root", or "copy root worktree changes here".
---

# grab-root

Copy the uncommitted changes (staged, unstaged, untracked, deletions) from the root worktree into the current worktree. The root worktree wins on any conflict.

## Steps

1. **Locate the worktrees.**
   - Run `git worktree list --porcelain`. The first entry is the root worktree.
   - Run `git rev-parse --show-toplevel` for the current worktree.
   - If the current worktree IS the root worktree, or there is no git repo, say so and stop.

2. **Inspect root changes (read-only).**
   - `git -C <root> status --porcelain=v1 -z --untracked-files=all`
   - `git -C <root> diff HEAD --shortstat`
   - If there are no changes, report "root worktree is clean" and stop.

3. **Size check.** The change set is "large" if any of these is true:
   - more than 25 changed files
   - more than 1000 added+deleted lines
   - any single changed file over 1 MB or any binary file
   
   If large, show the file count, line counts, and the top ~15 paths, then use the `question` tool to ask whether to **Proceed** or **Abort**. Default recommendation is Abort. Stop on Abort. If not large, proceed without asking.

4. **Apply, with root as source of truth.** For each path reported by root's status:
   - Added, modified, or untracked: copy the file from root to the same relative path in the current worktree, overwriting whatever is there (create parent directories as needed).
   - Deleted: delete the file in the current worktree if it exists.
   - Renamed: delete the old path and copy the new one.
   - Never touch `.git`, and never modify anything in the root worktree.
   - Do not discard or reset files that root did not change; leave them alone.
   - If a path in the current worktree has local modifications that will be overwritten, list it in the report so the user knows it was replaced.

5. **Report.** Show a short summary: root path, counts of copied / deleted / overwritten-local files, and `git status --short` of the current worktree. Do not commit.

## Notes

- Use PowerShell-compatible commands on Windows (`Copy-Item -Force`, `Remove-Item`, `New-Item -ItemType Directory -Force`).
- Quote paths; they may contain spaces.
