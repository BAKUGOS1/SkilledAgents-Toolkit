param(
  [switch]$All,
  [switch]$Skills,
  [switch]$CodexAgents,
  [switch]$Plugin,
  [switch]$Sdk,
  [switch]$LegacyCodexPath,
  [ValidateSet('qaagent', 'shaadikhata', 'phere-website', 'nuude', 'wrkly')]
  [string]$ProjectProfile,
  [string]$ProjectPath,
  [switch]$Force
)

$ErrorActionPreference = 'Stop'
$Root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path

if (!$All -and !$Skills -and !$CodexAgents -and !$Plugin -and !$Sdk -and !$ProjectProfile) {
  $Skills = $true
  $CodexAgents = $true
}
if ($All) {
  $Skills = $true
  $CodexAgents = $true
  $Plugin = $true
  $Sdk = $true
}

function Copy-Package {
  param(
    [string]$Source,
    [string]$Destination,
    [switch]$Overwrite
  )

  if (!(Test-Path -LiteralPath $Source)) {
    Write-Warning "Missing source: $Source"
    return
  }
  if ((Test-Path -LiteralPath $Destination) -and !$Overwrite) {
    Write-Output "Skip existing: $Destination"
    return
  }

  New-Item -ItemType Directory -Path (Split-Path -Parent $Destination) -Force | Out-Null
  Copy-Item -LiteralPath $Source -Destination $Destination -Recurse -Force:$Overwrite
  Write-Output "Installed: $Destination"
}

function Copy-Collection {
  param(
    [string]$SourceRoot,
    [string]$DestinationRoot,
    [switch]$Overwrite
  )

  New-Item -ItemType Directory -Path $DestinationRoot -Force | Out-Null
  Get-ChildItem -LiteralPath $SourceRoot -Directory | Sort-Object Name | ForEach-Object {
    Copy-Package $_.FullName (Join-Path $DestinationRoot $_.Name) -Overwrite:$Overwrite
  }
}

if ($Skills) {
  $canonicalTarget = Join-Path $env:USERPROFILE '.agents\skills'
  Copy-Collection (Join-Path $Root 'plugins\skilled-agents\skills') $canonicalTarget -Overwrite:$Force

  if ($LegacyCodexPath) {
    $legacyTarget = Join-Path $env:USERPROFILE '.codex\skills'
    Copy-Collection (Join-Path $Root 'plugins\skilled-agents\skills') $legacyTarget -Overwrite:$Force
  }
}

if ($CodexAgents) {
  $agentTarget = Join-Path $env:USERPROFILE '.codex\agents'
  $agentSource = Join-Path $Root 'agents\codex'
  if (Test-Path -LiteralPath $agentSource) {
    Get-ChildItem -LiteralPath $agentSource -Recurse -File -Filter '*.toml' | ForEach-Object {
      Copy-Package $_.FullName (Join-Path $agentTarget $_.Name) -Overwrite:$Force
    }
  }
}

if ($ProjectProfile) {
  if ([string]::IsNullOrWhiteSpace($ProjectPath)) {
    throw '-ProjectPath is required when -ProjectProfile is used.'
  }

  $resolvedProject = [System.IO.Path]::GetFullPath($ProjectPath)
  New-Item -ItemType Directory -Path $resolvedProject -Force | Out-Null
  $profileSkills = Join-Path $Root "skills\projects\$ProjectProfile"
  Copy-Collection $profileSkills (Join-Path $resolvedProject '.agents\skills') -Overwrite:$Force

  $profileGuide = Join-Path $Root "project-kits\$ProjectProfile\AGENTS.md"
  if (Test-Path -LiteralPath $profileGuide) {
    Copy-Package $profileGuide (Join-Path $resolvedProject 'AGENTS.md') -Overwrite:$Force
  }

  if ($ProjectProfile -eq 'wrkly') {
    $claudeAgentTarget = Join-Path $resolvedProject '.claude\agents'
    Get-ChildItem -LiteralPath (Join-Path $Root 'agents\claude\wrkly') -File -Filter '*.md' | ForEach-Object {
      Copy-Package $_.FullName (Join-Path $claudeAgentTarget $_.Name) -Overwrite:$Force
    }
  }
}

if ($Plugin) {
  $codex = Get-Command codex -ErrorAction SilentlyContinue
  if (!$codex) {
    Write-Warning 'Codex CLI was not found. Install manually with the commands shown in README.md.'
  } else {
    & $codex.Source plugin marketplace add BAKUGOS1/SkilledAgents-Toolkit
    if ($LASTEXITCODE -ne 0) {
      Write-Warning 'Marketplace add returned an error; it may already be configured.'
    }
    & $codex.Source plugin add skilled-agents@skilled-agents-toolkit
    if ($LASTEXITCODE -ne 0) {
      Write-Warning 'Plugin install failed. Direct skill installation remains available through -Skills.'
    }
  }
}

if ($Sdk) {
  & (Join-Path $PSScriptRoot 'install-sdk.ps1') -All
}

Write-Output 'Installation complete. Restart Codex to reload skills, agents, and plugins.'
