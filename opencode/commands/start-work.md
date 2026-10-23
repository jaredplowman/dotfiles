---
description: Create a worktree and new untracked working branch from a user-selected source branch
subagent: false
---

Create a managed worktree, start a new branch without upstream tracking, and move this session there. Requested work: $ARGUMENTS

Keep this setup fast: batch independent read-only checks; do not pause for extra model turns between simple checks. Do not fetch, push, implement, build, or modify the original checkout.

1. Identify product scope and read the applicable repository/product `AGENTS.md` files. Follow their naming rules. For AddVantage, use `users/{first-name}/{description-of-changes}` with the first name from `git config user.name` in lowercase and a concise kebab-case description. If the request refers to an Azure DevOps ID (`12345`, `#12345`) or work-item URL, parse the numeric ID and optional org/project from the URL. Run ONE preflight command in the current directory for local Git/worktree data (never interpolate raw `$ARGUMENTS` into a shell command):
    ```powershell
    & "$HOME\.config\opencode\commands\start-work-preflight.ps1"
    ```
    For work-item requests, load and follow the `azdo-work-item` skill to retrieve the item, relations, and comments through Azure DevOps MCP separately; do not pass `-Id` to the preflight script, which would call the older PAT-based REST helper. If MCP requires sign-in, ask the user to sign in using `/mcps` and retry; if retrieval still fails, ask whether to retry or proceed with a manual description. If the user name or requested work is insufficient, ask for what is missing.
2. ALWAYS use the `question` tool to ask which source branch to use, offering relevant exact existing local and remote-tracking refs and a custom answer. Do not assume `main`, the current branch, or a release branch. If a name is ambiguous, ask for the exact ref. For work items, derive the worktree name as `<id>-<concise-kebab-case-summary>` from the fetched title. Otherwise derive a meaningful name from the work request.
3. Resolve the selected source to an exact existing branch ref; for remote-tracking branches use the exact ref, e.g. `origin/releases/adv/7.2`. If missing, ask permission to fetch and re-check; never silently substitute. Before creating anything, validate the proposed branch with `git check-ref-format --branch`, verify the name is absent in `refs/heads/`, and verify no worktree of the same name exists. If either exists, ask for a new name. Batch these validations into one shell call and check exit codes (a missing branch is expected for the existence test).
4. Create the managed worktree by using `execute` to call `tools.opencode.worktree_create({ name: "<description-of-changes>" })`. This checks out the current HEAD first. Inside the returned root, create the branch at the chosen source without upstream tracking:
   ```powershell
   git -C "<worktree-root>" switch --no-track -c "<new-branch>" "<source-ref>"
   ```
   Safely quote all values; do not run descriptions as shell code. Verify the switch succeeded, `git -C "<worktree-root>" branch --show-current` is the requested branch, and `git -C "<worktree-root>" config --get "branch.<new-branch>.merge"` is empty. If tracking exists, unset it and verify again. Never use `git checkout -b` or `git switch -c` without `--no-track`. On any failure, stop and report the created worktree rather than moving the session.
5. Move the session using `execute` with `tools.opencode.session_move({ directory: "<worktree-root>\\<relativeDirectory>" })` (use the root itself when the relative directory is empty). Rename it with `tools.opencode.session_rename({ title: "<work-focused-title>" })`; these two tool calls can share one `execute` call but await `session_move` before `session_rename`. For work items, use `#<id>: <Concise Work Item Title>`; otherwise use the requested work, not the setup process.
6. Confirm the new path, branch, source ref and absence of upstream tracking. For work items, include the fetched work-item title, type, state, description/repro steps, acceptance criteria, relations and comments so the session has the context.
7. Assess readiness and respond:
   - Inspect the relevant files in the new worktree if needed to evaluate whether the task and codebase requirements are clear.
   - Explicitly state whether you are **ready and have enough context to continue**, or if you **need more information**.
   - If you **have enough context and are ready to go**: output the implementation plan directly so the user can review it and start execution with `/build`.
   - If you **need more information**: specify the exact missing context, ambiguities, or decisions required before a plan can be finalized.
   - Do not implement or build changes during `/start-work`.
