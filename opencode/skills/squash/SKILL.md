---
name: squash
description: Squash all commits on the current branch since a target branch into a single feat, fix, or chore commit, summarizing the existing commit messages and descriptions (with an optional flag to inspect code diffs).
compatibility: opencode
---

## Usage

- `@squash <target-branch>` — rebase onto `<target-branch>` and squash all branch commits into one commit, summarizing only the commit messages and descriptions.
- `@squash` — prompt for `<target-branch>` if not specified, then squash using commit messages and descriptions only.
- `@squash <target-branch> --code` (or natural language such as "look at the code" / "inspect diff") — also inspect the code changes (`git diff`) in addition to the commit messages when crafting the squashed commit message.
- `@squash <target-branch> fix|feat|chore` — explicitly force the commit type (`fix`, `feat`, or `chore`).

Additional text supplies extra instructions for the commit message, for example:
`@squash origin/main feat Emphasize the new retry policy.`

## Rules & Boundaries

- **Commit messages only by default**: Unless the user explicitly passes `--code` (or asks to inspect/look at the code or diff), you **must not** run `git diff`, read source files, or inspect code changes to determine the commit message. Rely strictly on the commit subjects and bodies in `git log <merge-base>..HEAD`.
- **Opt-in code inspection**: Only when `--code` (or an explicit request to look at the code/diff) is provided may you inspect `git diff <merge-base>..HEAD` and modified files to supplement the commit messages.
- **No "squash" in the commit message**: Never use the word "squash" or "squashed" anywhere in the generated commit subject or body.
- **No push**: Never push the branch unless explicitly asked.

## Workflow

1. **Verify repository and working tree**:
   - Check `git status --porcelain` and `git branch --show-current`.
   - If the current directory is not in a Git repository, ask for the repository location.
   - If the working tree has uncommitted staged or unstaged changes, or if `HEAD` is detached, stop and ask the user how they want to proceed before modifying history.

2. **Determine the target branch**:
   - If the user specified a target branch or ref in their prompt, verify it exists with `git rev-parse --verify "<target-branch>^{commit}"`. If both `<target-branch>` and `origin/<target-branch>` exist or if the ref cannot be found, clarify with the `question` tool.
   - If the user did not specify a target branch, inspect relevant local and remote branches (for example via `git branch -a`) and use the `question` tool to ask which target branch to squash onto.

3. **Inspect the commits to be squashed**:
   - If the current branch is not already strictly ahead of `<target-branch>` (i.e. `<target-branch>` has newer commits not yet in `HEAD`), rebase the current branch onto `<target-branch>` first (`git rebase "<target-branch>"`). If a rebase conflict occurs, stop, report the conflicting files, and ask the user how to proceed.
   - Resolve the merge base:
     ```powershell
     $base = git merge-base "<target-branch>" HEAD
     ```
   - Collect the commit count and full commit subjects and bodies in chronological order (`--reverse`):
     ```powershell
     git log --reverse --format="--- COMMIT %H ---%nSubject: %s%nBody:%n%b" "$base..HEAD"
     ```
   - If there are 0 commits between `$base` and `HEAD`, report that there are no commits to squash and stop.
   - If there is only 1 commit, ask the user via `question` whether they still want to rewrite its commit message or leave it as-is.

4. **Inspect code changes (ONLY if requested)**:
   - **Default**: Do **not** inspect code diffs or read modified files. Use only the output from `git log` above.
   - **If `--code` or code inspection was explicitly requested**: Run `git diff --stat "$base..HEAD"` and `git diff "$base..HEAD"` to understand the implementation details alongside the commit messages.

5. **Determine the commit type (`feat`, `fix`, or `chore`)**:
   - If the user explicitly requested `feat`, `fix`, or `chore`, use that type.
   - Otherwise, infer the primary intent from the commit messages (and code diff if enabled):
     - **fix**: corrects broken or incorrect behavior, bugs, or regressions.
     - **feat**: adds or expands functionality.
     - **chore**: maintenance, tooling, dependencies, documentation, tests, or behavior-preserving refactoring without a primary bug fix or feature.
   - If the intent is ambiguous or mixed without a clear primary type, use the `question` tool to ask the user whether to use `feat`, `fix`, or `chore`.

6. **Synthesize the commit message**:
   - Summarize the collected commit subjects and descriptions into a cohesive commit message:
     - **Subject**:
       - Must start with `<type>: ` (`feat: `, `fix: `, or `chore: `).
       - Must be a concise, descriptive title of **120 characters or fewer**.
       - Must describe the primary overall change clearly.
     - **Body**:
       - Summarize the key changes and rationale from the individual commit descriptions and messages (and code changes if `--code` was used).
       - Consolidate redundant or intermediate "WIP" / "fix typo" notes into a clean, well-structured summary rather than blindly concatenating raw commit logs.
       - Never include the word "squash" or "squashed".

7. **Squash the commits onto the target base**:
   - Equivalent to an interactive rebase where the first commit is picked and all subsequent commits are squashed into one commit directly on top of `$base`:
     ```powershell
     git reset --soft $base
     git commit -m "<subject>" -m "<body>"
     ```
   - Verify the commit succeeded and that `git status --short` is clean.

8. **Report the result**:
   - Report the new commit hash, target base branch, number of commits combined, and the final commit subject and body.
