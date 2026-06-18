param(
  [string[]]$ProjectRoot = @(),
  [switch]$Force
)

$ErrorActionPreference = 'Stop'
$Root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$excludedGlobalSkills = @('.system', 'emil-design-eng')

function Convert-ToSlug([string]$Value) {
  $slug = $Value.ToLowerInvariant() -replace '[^a-z0-9]+', '-'
  return $slug.Trim('-')
}

function Copy-Package {
  param(
    [string]$Source,
    [string]$Destination,
    [switch]$Overwrite
  )

  if (!(Test-Path -LiteralPath $Source)) { return }
  if ((Test-Path -LiteralPath $Destination) -and !$Overwrite) {
    Write-Output "Skip existing: $Destination"
    return
  }

  New-Item -ItemType Directory -Path (Split-Path -Parent $Destination) -Force | Out-Null
  Copy-Item -LiteralPath $Source -Destination $Destination -Recurse -Force:$Overwrite
  Write-Output "Synced: $Source"
}

$globalCodex = Join-Path $env:USERPROFILE '.codex\skills'
if (Test-Path -LiteralPath $globalCodex) {
  Get-ChildItem -LiteralPath $globalCodex -Directory | Where-Object {
    $_.Name -notin $excludedGlobalSkills
  } | ForEach-Object {
    Copy-Package $_.FullName (Join-Path $Root "skills\codex\$($_.Name)") -Overwrite:$Force
  }
}

$globalAgents = Join-Path $env:USERPROFILE '.agents\skills'
if (Test-Path -LiteralPath $globalAgents) {
  Get-ChildItem -LiteralPath $globalAgents -Directory | ForEach-Object {
    Copy-Package $_.FullName (Join-Path $Root "skills\agents-global\$($_.Name)") -Overwrite:$Force
  }
}

foreach ($project in $ProjectRoot) {
  if (!(Test-Path -LiteralPath $project)) {
    Write-Warning "Project root not found: $project"
    continue
  }

  $resolvedProject = (Resolve-Path -LiteralPath $project).Path
  $slug = Convert-ToSlug (Split-Path -Leaf $resolvedProject)
  $projectDestination = Join-Path $Root "skills\projects\$slug"

  foreach ($surface in @('.agents\skills', '.codex\skills', '.claude\skills', '.antigravity\skills')) {
    $surfacePath = Join-Path $resolvedProject $surface
    if (!(Test-Path -LiteralPath $surfacePath)) { continue }
    Get-ChildItem -LiteralPath $surfacePath -Directory | Where-Object {
      Test-Path -LiteralPath (Join-Path $_.FullName 'SKILL.md')
    } | ForEach-Object {
      Copy-Package $_.FullName (Join-Path $projectDestination $_.Name) -Overwrite:$Force
    }
  }

  foreach ($agentSurface in @(
    @{ Source = '.codex\agents'; Destination = "agents\codex\$slug"; Filter = '*.toml' },
    @{ Source = '.claude\agents'; Destination = "agents\claude\$slug"; Filter = '*.md' }
  )) {
    $sourcePath = Join-Path $resolvedProject $agentSurface.Source
    if (!(Test-Path -LiteralPath $sourcePath)) { continue }
    Get-ChildItem -LiteralPath $sourcePath -File -Filter $agentSurface.Filter | ForEach-Object {
      Copy-Package $_.FullName (Join-Path $Root "$($agentSurface.Destination)\$($_.Name)") -Overwrite:$Force
    }
  }

  $guide = Join-Path $resolvedProject 'AGENTS.md'
  if (Test-Path -LiteralPath $guide) {
    Copy-Package $guide (Join-Path $Root "project-kits\$slug\AGENTS.md") -Overwrite:$Force
  }
}

& (Join-Path $PSScriptRoot 'rebuild-plugin.ps1')
& (Join-Path $PSScriptRoot 'build-manifest.ps1')
& (Join-Path $PSScriptRoot 'validate.ps1')

Write-Output 'Local skill and agent sync completed.'

