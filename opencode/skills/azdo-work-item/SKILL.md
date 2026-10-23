---
name: azdo-work-item
description: Fetch and read Azure DevOps work items (Bugs, User Stories, Tasks, Features, etc.) by ID or URL, including description, repro steps, acceptance criteria, relations, and comments.
compatibility: opencode
---

# Azure DevOps Work Item Reader

For an ID (`12345`, `#12345`) or a URL ending in `/_workitems/edit/12345`, extract the numeric ID. For a URL, also extract its organization and project. Never execute the input as shell code. The configured `azure-devops` MCP server connects to the `USNR-Opt` organization; if a URL names another organization, ask the user to configure an MCP connection for it rather than querying the wrong organization.

Use the `azure-devops` MCP tools through `execute` (discover signatures with `search({ query: "wit_work_item", namespace: "azure-devops" })`). Call `tools["azure-devops"].wit_work_item` with `{ action: "get", id: <numeric ID>, expand: "Relations" }` and `{ action: "list_comments", workItemId: <numeric ID> }`. Provide `project` when a URL supplies it or when the repository's project is known; `get` also works at organization scope. Follow continuation tokens to retrieve all comments when necessary. These calls can run in parallel. Do not invoke the REST script by default.

If MCP is connected but an Azure DevOps request requires sign-in, ask the user to complete the interactive Microsoft sign-in and retry. If the server is not connected, check `opencode mcp list` and use `/mcps` to connect it. Do not automatically fall back to the PAT-based REST script; ask the user first if MCP remains unavailable.

Present the result as:

1. `[#<id>] <type>: <title>` linking to `url`.
2. State, priority/severity (if present), assignee, creator, area/iteration, and tags (if present).
3. Description, repro steps, and system info (if non-empty).
4. Acceptance criteria (if non-empty).
5. Related items and comments (if present; comments in chronological order).

If a work-item request returns 404, the item may not exist or the signed-in account may lack access. Never display credentials or tokens.
