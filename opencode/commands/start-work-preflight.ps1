param(
    [ValidateRange(0, 2147483647)]
    [int]$Id = 0,
    [string]$Organization,
    [string]$Project
)

$ErrorActionPreference = 'Stop'
$root = (git rev-parse --show-toplevel).Trim()
if ($LASTEXITCODE -ne 0) { throw 'Not in a Git repository.' }
$current = (Get-Location).Path
$rootPath = $root.Replace('/', '\').TrimEnd('\')
if (-not $current.StartsWith("$rootPath\", [StringComparison]::OrdinalIgnoreCase) -and
    -not $current.Equals($rootPath, [StringComparison]::OrdinalIgnoreCase)) {
    throw 'The current directory is outside the repository root.'
}
$relativeDirectory = $current.Substring($rootPath.Length).TrimStart('\', '/')
$userName = git config user.name
if (-not $userName) { $userName = '' }
$currentBranch = git branch --show-current
if (-not $currentBranch) { $currentBranch = '' }
$worktrees = @(git worktree list --porcelain)
$localBranches = @(git for-each-ref --format='%(refname:short)' refs/heads)
$remoteBranches = @(git for-each-ref --format='%(refname:short)' refs/remotes)

$item = $null
$itemError = $null
if ($Id) {
    $script = Join-Path $PSScriptRoot '..\skills\azdo-work-item\fetch-work-item.ps1'
    $arguments = @{ Id = $Id }
    if ($Organization) { $arguments.Organization = $Organization }
    if ($Project) { $arguments.Project = $Project }
    try {
        $json = & $script @arguments 2>&1
        if ($LASTEXITCODE -ne 0) { throw ($json | Out-String).Trim() }
        $item = $json | ConvertFrom-Json
    } catch {
        $itemError = $_.Exception.Message
    }
}

[PSCustomObject]@{
    root = $root
    relativeDirectory = $relativeDirectory
    userName = $userName
    currentBranch = $currentBranch
    worktrees = $worktrees
    localBranches = $localBranches
    remoteBranches = $remoteBranches
    workItem = $item
    workItemError = $itemError
} | ConvertTo-Json -Depth 8
