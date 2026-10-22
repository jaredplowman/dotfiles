param(
    [Parameter(Mandatory = $true)]
    [ValidateRange(1, 2147483647)]
    [int]$Id,
    [string]$Organization,
    [string]$Project
)

$ErrorActionPreference = 'Stop'

function Convert-HtmlToText([string]$Html) {
    if ([string]::IsNullOrWhiteSpace($Html)) { return '' }
    $text = $Html -replace '(?i)<img[^>]+src=["'']([^"'']+)["''][^>]*>', "`n[Inline Image: `$1]`n"
    $text = $text -replace '(?i)<br\s*/?>', "`n"
    $text = $text -replace '(?i)</p>', "`n`n"
    $text = $text -replace '(?i)</div>', "`n"
    $text = $text -replace '(?i)</li>', "`n"
    $text = $text -replace '(?i)<li[^>]*>', '- '
    $text = $text -replace '(?i)</tr\s*>', "`n"
    $text = $text -replace '(?i)</t[dh]\s*>', ' | '
    $text = [System.Net.WebUtility]::HtmlDecode(($text -replace '<[^>]+>', ''))
    return ($text -replace "(\r?\n){3,}", "`n`n").Trim()
}

$remoteUrl = git remote get-url origin 2>$null
if (-not $Organization -or -not $Project) {
    if ($remoteUrl -match 'dev\.azure\.com/([^/]+)/([^/]+)/_git/') {
        if (-not $Organization) { $Organization = $Matches[1] }
        if (-not $Project) { $Project = $Matches[2] }
    } elseif ($remoteUrl -match '([^/.@]+)(?:@[^/]*)?\.visualstudio\.com/([^/]+)/_git/') {
        if (-not $Organization) { $Organization = $Matches[1] }
        if (-not $Project) { $Project = $Matches[2] }
    }
}
if (-not $Organization) { $Organization = 'USNR-Opt' }
if (-not $Project) { $Project = 'OptimizerSuite' }

$candidates = @()
if ($env:AZDO_PAT) { $candidates += @{ Source = 'env:AZDO_PAT'; Token = $env:AZDO_PAT.Trim() } }
$gitConfigPat = git config --get azdo.pat 2>$null
if ($gitConfigPat) { $candidates += @{ Source = 'git config azdo.pat'; Token = $gitConfigPat.Trim() } }
if ($remoteUrl -match 'https://([^@]+)@dev\.azure\.com/') {
    $candidates += @{ Source = 'git remote origin URL'; Token = $Matches[1].Trim() }
}
if ($candidates.Count -eq 0) {
    Write-Error 'No Azure DevOps PAT found. Set AZDO_PAT, git config azdo.pat, or credentials in the origin URL.'
    exit 1
}

$baseUri = "https://dev.azure.com/$([Uri]::EscapeDataString($Organization))/$([Uri]::EscapeDataString($Project))/_apis/wit/workitems/$Id"
$wi = $null
$lastError = ''
foreach ($candidate in $candidates) {
    $b64 = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes(":$($candidate.Token)"))
    $headers = @{ Authorization = "Basic $b64" }
    try {
        $wi = Invoke-RestMethod -Uri "$baseUri`?`$expand=relations&api-version=7.1" -Headers $headers -ErrorAction Stop
        break
    } catch {
        $status = if ($_.Exception.Response) { [int]$_.Exception.Response.StatusCode } else { 0 }
        $lastError = "[$($candidate.Source)] HTTP $status : $($_.Exception.Message)"
    }
}
if (-not $wi) {
    Write-Error "Failed to fetch work item #$Id from $Organization/$Project. $lastError Ensure the PAT has Work Items (Read) scope, or use a different PAT via AZDO_PAT or git config azdo.pat."
    exit 1
}

$comments = @()
try {
    $commentsRes = Invoke-RestMethod -Uri "$baseUri/comments?api-version=7.1-preview.4" -Headers $headers -ErrorAction Stop
    if ($commentsRes.comments) {
        $comments = @($commentsRes.comments | Sort-Object createdDate | ForEach-Object {
            [PSCustomObject]@{ author = $_.createdBy.displayName; date = $_.createdDate; text = Convert-HtmlToText $_.text }
        })
    }
} catch { } # Comments are optional; the work item itself is still useful.

$relations = @()
if ($wi.relations) {
    $relations = @($wi.relations | ForEach-Object {
        $target = $_.url
        if ($target -match '/workItems/(\d+)$') { $target = "Work Item #$($Matches[1])" }
        [PSCustomObject]@{
            type = if ($_.attributes.name) { $_.attributes.name } else { $_.rel }
            target = $target
            title = $_.attributes.comment
        }
    })
}

$f = $wi.fields
[PSCustomObject]@{
    id = $wi.id
    url = "https://dev.azure.com/$Organization/$Project/_workitems/edit/$($wi.id)"
    type = $f.'System.WorkItemType'
    title = $f.'System.Title'
    state = $f.'System.State'
    reason = $f.'System.Reason'
    assignedTo = $f.'System.AssignedTo'.displayName
    createdBy = $f.'System.CreatedBy'.displayName
    areaPath = $f.'System.AreaPath'
    iterationPath = $f.'System.IterationPath'
    tags = $f.'System.Tags'
    priority = $f.'Microsoft.VSTS.Common.Priority'
    severity = $f.'Microsoft.VSTS.Common.Severity'
    description = Convert-HtmlToText $f.'System.Description'
    reproSteps = Convert-HtmlToText $f.'Microsoft.VSTS.TCM.ReproSteps'
    systemInfo = Convert-HtmlToText $f.'Microsoft.VSTS.TCM.SystemInfo'
    acceptanceCriteria = Convert-HtmlToText $f.'Microsoft.VSTS.Common.AcceptanceCriteria'
    relations = $relations
    comments = $comments
} | ConvertTo-Json -Depth 6
