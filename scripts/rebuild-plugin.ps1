param(
  [string]$Root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
)

$ErrorActionPreference = 'Stop'
$pluginSkills = Join-Path $Root 'plugins\skilled-agents\skills'
$resolvedRoot = [System.IO.Path]::GetFullPath($Root)
$resolvedPluginSkills = [System.IO.Path]::GetFullPath($pluginSkills)

if (!$resolvedPluginSkills.StartsWith($resolvedRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
  throw "Plugin destination escaped the repository root: $resolvedPluginSkills"
}

New-Item -ItemType Directory -Path $pluginSkills -Force | Out-Null
Get-ChildItem -LiteralPath $pluginSkills -Directory -Force | Remove-Item -Recurse -Force

function Get-SkillName([string]$SkillFile) {
  $raw = Get-Content -LiteralPath $SkillFile -Raw
  if ($raw -match '(?m)^name:\s*(.+?)\s*$') {
    return $Matches[1].Trim().Trim('"', "'")
  }
  return $null
}

$seen = @{}
$copied = 0
$skillFiles = Get-ChildItem -LiteralPath (Join-Path $Root 'skills') -Recurse -File -Filter 'SKILL.md' |
  Sort-Object FullName

foreach ($skillFile in $skillFiles) {
  $name = Get-SkillName $skillFile.FullName
  if ([string]::IsNullOrWhiteSpace($name)) {
    Write-Warning "Skip skill without a name: $($skillFile.FullName)"
    continue
  }
  if ($seen.ContainsKey($name)) {
    Write-Output "Deduplicate '$name'; keeping $($seen[$name])"
    continue
  }

  $packageRoot = Split-Path -Parent $skillFile.FullName
  $folderName = Split-Path -Leaf $packageRoot
  $destination = Join-Path $pluginSkills $folderName
  if (Test-Path -LiteralPath $destination) {
    $folderName = ($name -replace '[^A-Za-z0-9._-]', '-').Trim('-')
    $destination = Join-Path $pluginSkills $folderName
  }

  Copy-Item -LiteralPath $packageRoot -Destination $destination -Recurse -Force
  $seen[$name] = $skillFile.FullName
  $copied++
}

Write-Output "Rebuilt umbrella plugin with $copied unique skills."

