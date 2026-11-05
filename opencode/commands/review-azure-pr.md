---
description: Review an Azure DevOps PR by number without changing your checkout or cloning without approval
subagent: false
---

Load and follow the `review-azure-pr` skill to review Azure DevOps PR $ARGUMENTS. Treat the argument as a PR number or URL, not a shell command. If no PR number or URL was given, ask for one. Keep the review API-only by default and ask for explicit permission before any clone or Git fetch. Report findings in this conversation; do not modify the working tree or post to Azure DevOps.
