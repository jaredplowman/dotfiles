---
description: Sync OpenCode configuration (skills, commands, plugins, AGENTS.md, cli.json, opencode.json) with the dotfiles repository
subagent: false
---

Sync the OpenCode configuration between `~/.config/opencode` (`$HOME\.config\opencode` on Windows) and the `opencode/` directory in the dotfiles repository. Additional context or arguments: $ARGUMENTS

1. **Locate the dotfiles repository**:
   - If a path is explicitly provided in `$ARGUMENTS`, check that path first.
   - Otherwise, check `C:\Code\dotfiles` (or `~/dotfiles` on Linux/macOS).
   - Verify the directory exists and is a valid Git repository (`git -C "<path>" rev-parse --is-inside-work-tree`).
   - If `C:\Code\dotfiles` (or the provided path) cannot be found or is not a Git repository, use the `question` tool to ask the user for the dotfiles repository location. Do not guess or create a new repository without asking.

2. **Scope & exclusions**:
   - **Included paths** (under `~/.config/opencode` <-> `<dotfiles>/opencode`):
     - `skills/` (all skills and bundled scripts)
     - `commands/` (all slash command markdown files and scripts)
     - `tui-worktree-indicator/` (`package.json`, `tui.tsx`)
     - `AGENTS.md`
     - `cli.json`
     - `opencode.json`
   - **Always excluded** (never copy into `<dotfiles>/opencode` or overwrite in `~/.config/opencode`):
     - `service.json` (contains plaintext credentials/passwords)
     - `node_modules/`, `package.json` (root), `package-lock.json`, `bun.lock`, `.gitignore` (root runtime artifacts)
     - `settings.json` and empty runtime directories (`agents/`, `hooks/`, `prompts/` unless non-empty and explicitly requested)

3. **Determine direction & compare**:
   - Default direction is **Push to dotfiles** (`~/.config/opencode` -> `<dotfiles>/opencode`), updating the dotfiles repo with the latest local OpenCode customizations.
   - If `$ARGUMENTS` requests pulling/restoring (e.g., `pull`, `restore`, `from-dotfiles`, or `install`), or if `~/.config/opencode` is missing files that exist in `<dotfiles>/opencode`, ask via the `question` tool whether to sync **into dotfiles** (`~/.config/opencode` -> `<dotfiles>/opencode`) or **from dotfiles** (`<dotfiles>/opencode` -> `~/.config/opencode`).
   - When syncing **from dotfiles** (`<dotfiles>/opencode` -> `~/.config/opencode`), inspect `opencode.json` LSP server paths (`roslyn-language-server` versioned path under `.dotnet/tools/.store`, global `npm` root, `clangd`, `node`) and verify they exist on the current machine; if version numbers or OS paths differ, update them to match the installed versions on the machine.
   - If any file exists only in the destination (e.g. a skill or command was deleted in the source), ask the user via the `question` tool before deleting it from the destination.

4. **Apply sync & report**:
   - Copy the added/modified files across for `skills/`, `commands/`, `tui-worktree-indicator/`, `AGENTS.md`, `cli.json`, and `opencode.json`.
   - Run `git -C "<dotfiles>" status --short opencode/` and `git -C "<dotfiles>" diff --stat opencode/` to verify the result.
   - Present a concise summary of all synced files and ask via the `question` tool if the user would like to commit (and optionally push) the changes in the dotfiles repository.
