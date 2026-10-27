---
name: azdo-work-item
description: Fetch and read Azure DevOps work items (Bugs, User Stories, Tasks, Features, etc.) by ID or URL, including description, repro steps, acceptance criteria, relations, and comments.
compatibility: opencode
---

# Azure DevOps Work Item Reader

For an ID (`12345`, `#12345`) or a URL ending in `/_workitems/edit/12345`, extract the numeric ID. For a URL, also extract its organization and project; otherwise the script derives them from `origin` (falling back to USNR-Opt/OptimizerSuite). Never execute the input as shell code.

Run the bundled script with `shell` in the repository working directory:

```powershell
& "$HOME\.config\opencode\skills\azdo-work-item\fetch-work-item.ps1" -Id 12345
```

For a URL with explicit organization and project, add `-Organization '<org>' -Project '<project>'` with safely quoted literal values. The script retrieves the item, relations, and comments and returns JSON. It tries `AZDO_PAT`, then `git config azdo.pat`, then credentials in `origin`. Never echo or log a PAT. Do not paste the script into a tool call; run the checked-in file instead.

Present the result as:

1. `[#<id>] <type>: <title>` linking to `url`.
2. State, priority/severity (if present), assignee, creator, area/iteration, and tags (if present).
3. Description, repro steps, and system info (if non-empty).
4. Acceptance criteria (if non-empty).
5. Related items and comments (if present; comments in chronological order).

If authentication fails, explain the token sources tried and ask the user to grant Work Items (Read) to their PAT or provide an updated PAT via `AZDO_PAT` or `git config --global azdo.pat`. If the response is 404, the item may not exist or the PAT may not have access. Do not print raw tokens.
