---
name: preview-worktree
description: Syncs a linked Git worktree's branch and uncommitted changes into the main repository checkout via detached HEAD and automatically propagates subsequent worktree changes across turns so the user can compile and visually test using their warm IDE and build cache.
---

# Preview Worktree in Main Checkout

Sync a linked Git worktree's state into the main repository checkout (for example, `C:\Code\OptimizerSuite`) using detached `HEAD` and keep it continuously synced as changes are made in the worktree, so the user can compile and visually test with their existing warm build cache (`Packages/`, `Temp/`, `Lib/`, `Bin/`) and open IDE.

## Rules & Boundaries

- **Source of truth**: Make all code edits (`edit`, `write`, `git commit`, etc.) in the active linked worktree (`<source-worktree>`).
- **Continuous turn-end tracking (Default)**: Once `preview-worktree` is activated in a session, tracking stays active by default. At the end of **every subsequent turn** in which you edit, create, delete, or commit files in `<source-worktree>`, automatically propagate those changes to `<main-worktree>` without waiting for the user to ask again.
- **Opting out / stopping**: Only skip subsequent propagation if the user explicitly requests a one-time sync or asks to stop tracking.
- **Build artifacts boundary**: Never touch `<main-worktree>` build artifacts (`Temp/`, `Bin/`, `Lib/`, `Packages/`) or run `msbuild` unless explicitly requested.

## Initial Sync Workflow

1. **Inspect worktrees**:
   - Run `git worktree list --porcelain` to identify:
     - The **main worktree** (the first worktree entry, e.g., `C:/Code/OptimizerSuite`).
     - All **linked worktrees**, their directories, `HEAD` commits, and checked-out branches.

2. **Determine the source worktree**:
   - Check the current working directory (`git rev-parse --show-toplevel`).
   - If the current working directory is inside a **linked worktree** (or the user specified a worktree/branch in their prompt), use that linked worktree as the source automatically.
   - If the current working directory is the **main worktree** and the user did not specify which worktree/branch to preview, use the `question` tool to let the user choose from the active linked worktrees (or recent `users/*` branches).

3. **Check main worktree cleanliness**:
   - Run `git -C "<main-worktree>" status --porcelain` and `git -C "<main-worktree>" branch --show-current`.
   - If the main worktree has uncommitted tracked modifications:
     - Show the modified files and use the `question` tool to ask whether to:
       1. Discard the tracked changes in `<main-worktree>` (common when switching from a previous preview with applied diffs) and proceed, or
       2. Abort so the user can save/commit their work in `<main-worktree>`.
     - Never discard changes in `<main-worktree>` on initial setup without explicit confirmation.

4. **Detach HEAD in the main worktree**:
   - Resolve the source worktree's current `HEAD` commit (`git -C "<source-worktree>" rev-parse HEAD`) and branch name (`git -C "<source-worktree>" branch --show-current`).
   - Switch the main worktree to that commit in detached `HEAD` mode:
     ```powershell
     git -C "<main-worktree>" switch --detach <commit-sha>
     ```

5. **Carry over uncommitted edits from the source worktree (if any)**:
   - Check `git -C "<source-worktree>" status --porcelain`.
   - If the source worktree has uncommitted tracked changes (staged or unstaged):
     - Create a byte-exact patch file in `$env:LOCALAPPDATA\Temp\opencode\preview-worktree.patch` (avoid PowerShell stdout piping, which alters line endings):
       ```powershell
       git -C "<source-worktree>" diff HEAD --binary --output "$env:LOCALAPPDATA\Temp\opencode\preview-worktree.patch"
       git -C "<main-worktree>" apply --binary "$env:LOCALAPPDATA\Temp\opencode\preview-worktree.patch"
       Remove-Item "$env:LOCALAPPDATA\Temp\opencode\preview-worktree.patch" -Force -ErrorAction SilentlyContinue
       ```
   - If the source worktree has new untracked source files (`git -C "<source-worktree>" ls-files --others --exclude-standard`), copy them to the matching relative paths in `<main-worktree>` and list them in your summary.

6. **Report status**:
   - Report the source worktree path, branch name, detached commit SHA, and any uncommitted/untracked files synced into `<main-worktree>`.
   - Confirm that continuous tracking is active (subsequent edits in `<source-worktree>` will auto-propagate to `<main-worktree>`) and remind the user that `<main-worktree>` is ready to compile in their IDE.

## Turn-End Auto-Propagation (Subsequent Turns)

Whenever tracking is active and you modify, create, delete, or commit files in `<source-worktree>` during a turn, run this fast sync before ending your turn (do not re-prompt the user):

1. **Sync `HEAD` and reset prior preview diff in `<main-worktree>`**:
   ```powershell
   $headSha = git -C "<source-worktree>" rev-parse HEAD
   git -C "<main-worktree>" checkout -f -- .
   git -C "<main-worktree>" switch --detach $headSha
   ```
2. **Apply current uncommitted changes from `<source-worktree>`**:
   ```powershell
   $patch = "$env:LOCALAPPDATA\Temp\opencode\preview-worktree.patch"
   git -C "<source-worktree>" diff HEAD --binary --output $patch
   if ((Get-Item $patch).Length -gt 0) {
       git -C "<main-worktree>" apply --binary $patch
   }
   Remove-Item $patch -Force -ErrorAction SilentlyContinue
   ```
3. **Sync untracked files**:
   - Copy any new/updated untracked source files (`git -C "<source-worktree>" ls-files --others --exclude-standard`) to their matching relative paths in `<main-worktree>`, and remove any previously copied untracked files that were deleted in `<source-worktree>`.
4. **Briefly confirm**: Mention in a short note at the end of your response that the changes were propagated to `<main-worktree>`.
