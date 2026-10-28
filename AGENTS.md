# AGENTS.md

## Overview
Personal cross-platform dotfiles repository (Linux/macOS and Windows). There is no central build, test runner, or installation script.

## Layout & Stow Deployment
- **GNU Stow (`~/.config`)**: `.stowrc` sets `--target=~/.config` and ignores `.stowrc`, `DS_Store`, and `atuin/*`. Note that running `stow .` links the repository root directly into `~/.config` (as a single package) rather than stowing per-tool subdirectories individually.
- **Standalone / OS-specific configs** (not managed via `~/.config` stow):
  - `.vimrc`, `.ideavimrc`: Vim and JetBrains IdeaVim configs (note: both use `#` for comments in several places, which is valid in IdeaVimrc but invalid in standard Vim).
  - `atuin-with-fzf.sh`: Bash integration binding `Ctrl+R` and `Ctrl+E` to `atuin search` piped through `fzf`.
  - `development-machine.ahk`: AutoHotkey v2.0 script for Windows virtual desktop switching (`Ctrl+Shift+1..4`).
  - `powershell/settings.json`: Windows Terminal (`settings.json`) configuration, despite the directory name.
  - `jetbrains/`: Exported Rider / IntelliJ global settings (`options/*.xml`, `keymaps/`, `colors/`, `.DotSettings`).
  - `kinesis/active/`: Hardware layout and macro files for a Kinesis Advantage2 keyboard (`state.txt` points to `qwerty.txt`). `do_not_edit.txt` is binary/system-generated; `qwerty.txt` contains literal macros including plaintext strings/emails.

## Tool-Specific Quirks
- **OpenCode (`opencode/`)**:
  - Tracks `~/.config/opencode` customizations: `skills/`, `commands/`, `tui-worktree-indicator/`, `AGENTS.md`, `cli.json`, and `opencode.json`.
  - Use `/sync-dotfiles` (`opencode/commands/sync-dotfiles.md`) to sync between `~/.config/opencode` and this repo (checks `C:\Code\dotfiles` first and prompts if moved).
  - Never commit `service.json` (contains plaintext password) or root runtime dependency files (`node_modules/`, root `/package.json`, `package-lock.json`, `bun.lock`). Note that `opencode/tui-worktree-indicator/package.json` *is* tracked.
  - `opencode/opencode.json` contains hardcoded Windows paths and versioned `.dotnet/tools/.store/roslyn-language-server/<version>` paths—see `opencode/README.md` when disseminating to another machine or upgrading LSP tools.
- **Neovim (`nvim/`)**:
  - Based on LazyVim v8 (`nvim/lazyvim.json` manages enabled extras; `nvim/lazy-lock.json` pins plugins).
  - `nvim/lua/plugins/example.lua` has an early `if true then return {} end` guard on line 3—it is inactive template code. Put real plugin specs in new files under `nvim/lua/plugins/` or remove the guard.
  - Format Lua files with StyLua using `nvim/stylua.toml` (`stylua nvim/` — 2 spaces, 120 column width).
- **Tmux (`tmux/`)**:
  - Prefix is `Ctrl+A`. `tmux.conf` sources `~/.config/tmux/tmux.reset.conf` and expects TPM at `~/.tmux/plugins/tpm`.
  - `tmux.conf`, `tmux/scripts/cal.sh`, `wezterm/wezterm.lua`, and `starship/starship.toml` contain upstream paths/values from `omerxx`'s dotfiles (e.g., `/Users/omerxx/dotfiles`, `icalBuddy` macOS calendar script) alongside local paths (`/home/jared-plowman/...`). Do not assume hardcoded usernames or paths in those files match the current machine.
