param(
  [string]$Root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
)

$ErrorActionPreference = 'Stop'
$failures = New-Object System.Collections.Generic.List[string]
$warnings = New-Object System.Collections.Generic.List[string]

function Add-Failure([string]$Message) { $script:failures.Add($Message) | Out-Null }
function Add-Warning([string]$Message) { $script:warnings.Add($Message) | Out-Null }
function Get-RelativePath([string]$Path) {
  $rootPath = [System.IO.Path]::GetFullPath($Root).TrimEnd('\', '/')
  $fullPath = [System.IO.Path]::GetFullPath($Path)
  if (!$fullPath.StartsWith($rootPath, [System.StringComparison]::OrdinalIgnoreCase)) {
    return $fullPath.Replace('\', '/')
  }
  return $fullPath.Substring($rootPath.Length).TrimStart('\', '/').Replace('\', '/')
}

foreach ($required in @(
  'README.md',
  'LICENSE',
  'THIRD_PARTY_NOTICES.md',
  'MANIFEST.json',
  'INVENTORY.md',
  '.agents\plugins\marketplace.json',
  'plugins\skilled-agents\.codex-plugin\plugin.json'
)) {
  if (!(Test-Path -LiteralPath (Join-Path $Root $required))) {
    Add-Failure "Missing required file: $required"
  }
}

$allFiles = Get-ChildItem -LiteralPath $Root -Recurse -File -Force | Where-Object {
  $_.FullName -notmatch '\\.git\\|\\node_modules\\|\\\.venv\\|\\__pycache__\\'
}

$forbidden = @(
  '\\node_modules\\',
  '\\\.venv\\',
  '\\sessions\\',
  '\\archived_sessions\\',
  '\\browser-profile\\',
  '\\auth\.json$',
  '\\config\.toml$',
  '\\.env(\..*)?$',
  '\.sqlite(-.*)?$',
  '\.db(-.*)?$',
  '\.log$',
  '\.pyc$',
  '\.pyo$'
)

foreach ($file in $allFiles) {
  foreach ($pattern in $forbidden) {
    if ($file.FullName -match $pattern) {
      Add-Failure "Forbidden generated or sensitive path: $(Get-RelativePath $file.FullName)"
      break
    }
  }
}

$secretPatterns = [ordered]@{
  'GitHub token' = 'gh[pousr]_[A-Za-z0-9_]{20,}'
  'OpenAI key' = 'sk-[A-Za-z0-9]{24,}'
  'JWT-like token' = 'eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}'
  'Private key block' = '-----BEGIN (RSA |OPENSSH |EC |DSA |)?PRIVATE KEY-----'
  'Slack token' = 'xox[baprs]-[A-Za-z0-9-]{20,}'
}
$textExtensions = @('.md', '.txt', '.json', '.yaml', '.yml', '.toml', '.ps1', '.mjs', '.js', '.ts', '.tsx', '.py', '.csv')
foreach ($file in $allFiles | Where-Object { $textExtensions -contains $_.Extension.ToLowerInvariant() }) {
  $text = Get-Content -LiteralPath $file.FullName -Raw -ErrorAction SilentlyContinue
  foreach ($entry in $secretPatterns.GetEnumerator()) {
    if ($text -match $entry.Value) {
      Add-Failure "Possible $($entry.Key) in $(Get-RelativePath $file.FullName)"
    }
  }
}

$skillFiles = Get-ChildItem -LiteralPath $Root -Recurse -File -Filter 'SKILL.md' | Where-Object {
  $_.FullName -notmatch '\\.git\\|\\node_modules\\|\\\.venv\\'
}
if (@($skillFiles).Count -eq 0) {
  Add-Failure 'No SKILL.md files found.'
}

$archiveNames = @{}
foreach ($skillFile in $skillFiles) {
  $relative = Get-RelativePath $skillFile.FullName
  $raw = Get-Content -LiteralPath $skillFile.FullName -Raw
  if ($raw -notmatch '(?s)^\s*---\s*\r?\n(.*?)\r?\n---') {
    Add-Failure "Missing YAML frontmatter in $relative"
    continue
  }

  $frontmatter = $Matches[1]
  if ($frontmatter -notmatch '(?m)^name:\s*\S+') {
    Add-Failure "Missing frontmatter name in $relative"
  }
  if ($frontmatter -notmatch '(?m)^description:\s*\S+') {
    Add-Failure "Missing frontmatter description in $relative"
  }

  if ($relative.StartsWith('skills/') -and $frontmatter -match '(?m)^name:\s*(.+?)\s*$') {
    $name = $Matches[1].Trim().Trim('"', "'")
    if (!$archiveNames.ContainsKey($name)) {
      $archiveNames[$name] = New-Object System.Collections.Generic.List[string]
    }
    $archiveNames[$name].Add($relative) | Out-Null
  }
}

foreach ($name in ($archiveNames.Keys | Sort-Object)) {
  if ($archiveNames[$name].Count -gt 1) {
    Add-Warning "Duplicate archived skill name '$name': $($archiveNames[$name] -join ', ')"
  }
}

$pluginFiles = Get-ChildItem -LiteralPath (Join-Path $Root 'plugins') -Recurse -File -Filter 'plugin.json' | Where-Object {
  $_.FullName -match '\\.codex-plugin\\plugin\.json$'
}
foreach ($pluginFile in $pluginFiles) {
  try {
    $plugin = Get-Content -LiteralPath $pluginFile.FullName -Raw | ConvertFrom-Json
  } catch {
    Add-Failure "Invalid plugin JSON: $(Get-RelativePath $pluginFile.FullName)"
    continue
  }

  foreach ($field in @('name', 'version', 'description', 'skills')) {
    if ([string]::IsNullOrWhiteSpace([string]$plugin.$field)) {
      Add-Failure "Plugin missing '$field': $(Get-RelativePath $pluginFile.FullName)"
    }
  }
  if ($plugin.version -notmatch '^\d+\.\d+\.\d+([+-][0-9A-Za-z.-]+)?$') {
    Add-Failure "Plugin version is not semver: $(Get-RelativePath $pluginFile.FullName)"
  }
  if ([string]::IsNullOrWhiteSpace([string]$plugin.author.name)) {
    Add-Failure "Plugin missing author.name: $(Get-RelativePath $pluginFile.FullName)"
  }
  foreach ($field in @('displayName', 'shortDescription', 'longDescription', 'developerName', 'category')) {
    if ([string]::IsNullOrWhiteSpace([string]$plugin.interface.$field)) {
      Add-Failure "Plugin interface missing '$field': $(Get-RelativePath $pluginFile.FullName)"
    }
  }

  $pluginRoot = Split-Path -Parent (Split-Path -Parent $pluginFile.FullName)
  $skillsPath = Join-Path $pluginRoot ($plugin.skills -replace '^\./', '')
  if (!(Test-Path -LiteralPath $skillsPath)) {
    Add-Failure "Plugin skills path does not exist: $(Get-RelativePath $skillsPath)"
  }
}

$marketplacePath = Join-Path $Root '.agents\plugins\marketplace.json'
if (Test-Path -LiteralPath $marketplacePath) {
  try {
    $marketplace = Get-Content -LiteralPath $marketplacePath -Raw | ConvertFrom-Json
    foreach ($entry in $marketplace.plugins) {
      foreach ($field in @('name', 'category')) {
        if ([string]::IsNullOrWhiteSpace([string]$entry.$field)) {
          Add-Failure "Marketplace entry missing '$field'."
        }
      }
      if ([string]::IsNullOrWhiteSpace([string]$entry.policy.installation) -or
          [string]::IsNullOrWhiteSpace([string]$entry.policy.authentication)) {
        Add-Failure "Marketplace entry '$($entry.name)' is missing policy fields."
      }
      $pluginPath = Join-Path $Root ($entry.source.path -replace '^\./', '')
      if (!(Test-Path -LiteralPath (Join-Path $pluginPath '.codex-plugin\plugin.json'))) {
        Add-Failure "Marketplace plugin path is invalid for '$($entry.name)': $($entry.source.path)"
      }
    }
  } catch {
    Add-Failure 'Invalid marketplace JSON.'
  }
}

$agentRoot = Join-Path $Root 'agents\codex'
if (Test-Path -LiteralPath $agentRoot) {
  Get-ChildItem -LiteralPath $agentRoot -Recurse -File -Filter '*.toml' | ForEach-Object {
    $text = Get-Content -LiteralPath $_.FullName -Raw
    foreach ($field in @('name', 'description', 'developer_instructions')) {
      if ($text -notmatch "(?m)^$field\s*=") {
        Add-Failure "Custom agent missing '$field': $(Get-RelativePath $_.FullName)"
      }
    }
  }
}

$external = Join-Path $Root 'external-skills.json'
if (Test-Path -LiteralPath $external) {
  try {
    $externalJson = Get-Content -LiteralPath $external -Raw | ConvertFrom-Json
    foreach ($entry in $externalJson.skills) {
      if ($entry.distribution -eq 'reference-only') {
        $vendored = Get-ChildItem -LiteralPath (Join-Path $Root 'skills') -Recurse -Directory -ErrorAction SilentlyContinue |
          Where-Object { $_.Name -eq $entry.name }
        if ($vendored) {
          Add-Failure "Reference-only skill is also vendored: $($entry.name)"
        }
      }
    }
  } catch {
    Add-Failure 'Invalid external-skills.json.'
  }
}

$tsPackage = Get-Content -LiteralPath (Join-Path $Root 'sdk\typescript\package.json') -Raw | ConvertFrom-Json
if ($tsPackage.dependencies.'@openai/codex-sdk' -ne '0.141.0') {
  Add-Failure 'Unexpected TypeScript Codex SDK version.'
}
$pythonRequirement = (Get-Content -LiteralPath (Join-Path $Root 'sdk\python\requirements.txt') -Raw).Trim()
if ($pythonRequirement -ne 'openai-codex==0.1.0b3') {
  Add-Failure 'Unexpected Python Codex SDK version.'
}

if ($warnings.Count -gt 0) {
  Write-Output 'Warnings:'
  foreach ($warning in $warnings) { Write-Output "  - $warning" }
}
if ($failures.Count -gt 0) {
  Write-Output 'Validation failed:'
  foreach ($failure in $failures) { Write-Output "  - $failure" }
  exit 1
}

Write-Output "Validation passed: $(@($skillFiles).Count) skill files, $(@($pluginFiles).Count) plugins, $($warnings.Count) warnings."
