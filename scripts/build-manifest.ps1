param(
  [string]$Root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
)

$ErrorActionPreference = 'Stop'

function Get-RelativePath([string]$Path) {
  $rootPath = [System.IO.Path]::GetFullPath($Root).TrimEnd('\', '/')
  $fullPath = [System.IO.Path]::GetFullPath($Path)
  if (!$fullPath.StartsWith($rootPath, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Path is outside repository root: $fullPath"
  }
  return $fullPath.Substring($rootPath.Length).TrimStart('\', '/').Replace('\', '/')
}

function Get-Frontmatter {
  param([string]$Path)
  $raw = Get-Content -LiteralPath $Path -Raw
  if ($raw -notmatch '(?s)^\s*---\s*\r?\n(.*?)\r?\n---') {
    return [pscustomobject]@{ Name = $null; Description = $null }
  }

  $frontmatter = $Matches[1]
  $name = $null
  $description = $null
  if ($frontmatter -match '(?m)^name:\s*(.+?)\s*$') {
    $name = $Matches[1].Trim().Trim('"', "'")
  }
  if ($frontmatter -match '(?m)^description:\s*(.+?)\s*$') {
    $description = $Matches[1].Trim().Trim('"', "'")
  }

  return [pscustomobject]@{ Name = $name; Description = $description }
}

function Get-PackageStats([string]$PackageRoot) {
  $files = Get-ChildItem -LiteralPath $PackageRoot -Recurse -File -Force |
    Where-Object { $_.FullName -notmatch '\\node_modules\\|\\\.venv\\|\\__pycache__\\' }
  return [pscustomobject]@{
    file_count = @($files).Count
    byte_count = [int64](($files | Measure-Object Length -Sum).Sum)
  }
}

$archiveSkillFiles = Get-ChildItem -LiteralPath (Join-Path $Root 'skills') -Recurse -File -Filter 'SKILL.md' |
  Sort-Object FullName

$skills = foreach ($file in $archiveSkillFiles) {
  $metadata = Get-Frontmatter $file.FullName
  $packageRoot = Split-Path -Parent $file.FullName
  $stats = Get-PackageStats $packageRoot
  $relative = Get-RelativePath $file.FullName

  [pscustomobject]@{
    name = $metadata.Name
    description = $metadata.Description
    skill_md = $relative
    package_root = Get-RelativePath $packageRoot
    scope = ($relative -split '/')[1]
    has_openai_yaml = Test-Path -LiteralPath (Join-Path $packageRoot 'agents\openai.yaml')
    file_count = $stats.file_count
    byte_count = $stats.byte_count
  }
}

$codexAgents = @()
$codexAgentRoot = Join-Path $Root 'agents\codex'
if (Test-Path -LiteralPath $codexAgentRoot) {
  $codexAgents = Get-ChildItem -LiteralPath $codexAgentRoot -Recurse -File -Filter '*.toml' |
    Sort-Object FullName |
    ForEach-Object {
      [pscustomobject]@{
        format = 'codex-toml'
        path = Get-RelativePath $_.FullName
        bytes = $_.Length
      }
    }
}

$claudeAgents = @()
$claudeAgentRoot = Join-Path $Root 'agents\claude'
if (Test-Path -LiteralPath $claudeAgentRoot) {
  $claudeAgents = Get-ChildItem -LiteralPath $claudeAgentRoot -Recurse -File -Filter '*.md' |
    Sort-Object FullName |
    ForEach-Object {
      [pscustomobject]@{
        format = 'claude-markdown'
        path = Get-RelativePath $_.FullName
        bytes = $_.Length
      }
    }
}

$pluginManifests = Get-ChildItem -LiteralPath (Join-Path $Root 'plugins') -Recurse -File -Filter 'plugin.json' |
  Where-Object { $_.FullName -match '\\.codex-plugin\\plugin\.json$' } |
  Sort-Object FullName |
  ForEach-Object {
    $json = Get-Content -LiteralPath $_.FullName -Raw | ConvertFrom-Json
    [pscustomobject]@{
      name = $json.name
      version = $json.version
      path = Get-RelativePath $_.FullName
    }
  }

$excluded = @(
  'Built-in .system skills',
  'OpenAI bundled and curated plugin caches',
  'Vercel plugin caches',
  'Auth files, sessions, browser profiles, env files, databases, runtime logs, and generated run/status folders',
  'Unlicensed upstream source snapshots; these remain reference-only in external-skills.json'
)

$allFiles = Get-ChildItem -LiteralPath $Root -Recurse -File -Force | Where-Object {
  $_.FullName -notmatch '\\.git\\|\\node_modules\\|\\\.venv\\|\\__pycache__\\' -and
  $_.Name -notin @('MANIFEST.json', 'INVENTORY.md')
}

$manifest = [ordered]@{
  schema_version = 1
  repository = 'BAKUGOS1/SkilledAgents-Toolkit'
  purpose = 'Portable open-source toolkit for reusable Codex skills, custom agents, plugins, project kits, and SDK examples.'
  counts = [ordered]@{
    archived_skills = @($skills).Count
    codex_agents = @($codexAgents).Count
    claude_agents = @($claudeAgents).Count
    plugins = @($pluginManifests).Count
    total_files_excluding_generated = @($allFiles).Count
    total_bytes_excluding_generated = [int64](($allFiles | Measure-Object Length -Sum).Sum)
  }
  skills = $skills
  agents = @($codexAgents) + @($claudeAgents)
  plugins = $pluginManifests
  excluded_scope = $excluded
}

$manifest | ConvertTo-Json -Depth 10 | Set-Content -LiteralPath (Join-Path $Root 'MANIFEST.json') -Encoding UTF8

$inventory = New-Object System.Collections.Generic.List[string]
$inventory.Add('# Skills and Agents Inventory')
$inventory.Add('')
$inventory.Add("Archived skills: $(@($skills).Count)")
$inventory.Add("Codex agents: $(@($codexAgents).Count)")
$inventory.Add("Claude agents: $(@($claudeAgents).Count)")
$inventory.Add("Plugins: $(@($pluginManifests).Count)")
$inventory.Add('')
$inventory.Add('## Skills')
$inventory.Add('')
$inventory.Add('| Name | Package | Files | Bytes | openai.yaml |')
$inventory.Add('|---|---|---:|---:|---|')
foreach ($skill in $skills) {
  $openai = if ($skill.has_openai_yaml) { 'yes' } else { 'no' }
  $inventory.Add(('| `{0}` | `{1}` | {2} | {3} | {4} |' -f $skill.name, $skill.package_root, $skill.file_count, $skill.byte_count, $openai))
}
$inventory.Add('')
$inventory.Add('## Custom agents')
$inventory.Add('')
$inventory.Add('| Format | Path | Bytes |')
$inventory.Add('|---|---|---:|')
foreach ($agent in (@($codexAgents) + @($claudeAgents))) {
  $inventory.Add(('| `{0}` | `{1}` | {2} |' -f $agent.format, $agent.path, $agent.bytes))
}
$inventory.Add('')
$inventory.Add('## Plugins')
$inventory.Add('')
$inventory.Add('| Name | Version | Manifest |')
$inventory.Add('|---|---|---|')
foreach ($plugin in $pluginManifests) {
  $inventory.Add(('| `{0}` | `{1}` | `{2}` |' -f $plugin.name, $plugin.version, $plugin.path))
}
$inventory.Add('')
$inventory.Add('## Excluded by design')
$inventory.Add('')
foreach ($item in $excluded) {
  $inventory.Add("- $item")
}

$inventory | Set-Content -LiteralPath (Join-Path $Root 'INVENTORY.md') -Encoding UTF8
Write-Output "Wrote MANIFEST.json and INVENTORY.md for $(@($skills).Count) archived skills."
