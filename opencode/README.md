# OpenCode Configuration (`~/.config/opencode`)

This directory tracks personal OpenCode customizations:
- **`skills/`**: Custom skills (`azdo-work-item`, `changed-files`, `commit`, `context-transfer`, `preview-worktree`, `squash`).
- **`commands/`**: Custom slash commands (`build`, `close-work`, `commit-chore`, `commit-feat`, `commit-fix`, `preview`, `start-work`, `sync-dotfiles`) and `start-work-preflight.ps1`.
- **`tui-worktree-indicator/`**: Local TUI sidebar plugin showing the active workspace, worktree, and Git branch.
- **`cli.json`**: TUI theme (`catppuccin-macchiato`), keybindings, and plugin registration.
- **`opencode.json`**: Global LSP server configurations (`csharp`, `clangd`, `typescript`, `vue`, `json`).

> **Excluded files**: `service.json` (contains plaintext credentials), `settings.json`, and OpenCode's auto-generated runtime dependency files (`node_modules/`, root `package.json`, `package-lock.json`, `bun.lock`) are intentionally excluded via `.gitignore`.

---

## Ongoing Sync (`/sync-dotfiles`)

Once `commands/sync-dotfiles.md` is in `~/.config/opencode/commands/`, run:

```text
/sync-dotfiles
```

from any OpenCode session. It checks `C:\Code\dotfiles` (or prompts for the repo path if not found), syncs `skills/`, `commands/`, `tui-worktree-indicator/`, `cli.json`, and `opencode.json`, and shows a summary of changes.

---

## Disseminating to a New Machine

### 1. Copy files into `~/.config/opencode`

**PowerShell (Windows):**
```powershell
$dotfiles = "C:\Code\dotfiles\opencode" # Adjust if cloned elsewhere
$target = "$HOME\.config\opencode"
New-Item -ItemType Directory -Force -Path $target | Out-Null

foreach ($item in @("skills", "commands", "tui-worktree-indicator", "cli.json", "opencode.json")) {
    Copy-Item -Path (Join-Path $dotfiles $item) -Destination $target -Recurse -Force
}
```

**Bash (Linux / macOS):**
```bash
DOTFILES="${HOME}/dotfiles/opencode" # Adjust if cloned elsewhere
TARGET="${HOME}/.config/opencode"
mkdir -p "$TARGET"
cp -R "$DOTFILES/skills" "$DOTFILES/commands" "$DOTFILES/tui-worktree-indicator" "$DOTFILES/cli.json" "$DOTFILES/opencode.json" "$TARGET/"
```

### 2. Updating Machine- & Version-Specific Paths

When moving between machines or upgrading developer tools, verify the following:

1. **`opencode.json` (LSP paths & versions)**:
   - **`csharp` (`roslyn-language-server`)**: The path under `~/.dotnet/tools/.store/roslyn-language-server/<version>/...` includes the exact NuGet package version and target framework (`net10.0`). After installing or updating via `dotnet tool install -g roslyn-language-server` (or `dotnet tool update -g`), check the installed version with `dotnet tool list -g` and update the version string in `opencode.json`.
   - **`typescript`, `vue`, `json`**: Point to `node.exe` and global npm `node_modules` (`npm root -g`). Ensure `typescript`, `typescript-language-server`, `@vue/language-server`, and `vscode-langservers-extracted` are installed globally (`npm i -g ...`), and update the paths if your Node or global npm prefix differs.
   - **`clangd`**: Expects LLVM installed at `C:\Program Files\LLVM\bin\clangd.exe` (or `clangd` on PATH on Linux/macOS).
2. **Azure DevOps PAT (`azdo-work-item` & `/start-work`)**:
   - `skills/azdo-work-item/fetch-work-item.ps1` and `commands/start-work-preflight.ps1` require PowerShell (`powershell` on Windows, `pwsh` on Linux/macOS) and authenticate using `$env:AZDO_PAT`, `git config --global azdo.pat`, or credentials embedded in the `origin` remote URL.
3. **OpenCode Schema & Plugin API Versions**:
   - `cli.json` uses the v2 CLI schema (`https://opencode.ai/v2/cli.json`) and `tui-worktree-indicator/tui.tsx` imports `@opencode/plugin/tui`. OpenCode automatically manages its root `node_modules` inside `~/.config/opencode` on launch.
