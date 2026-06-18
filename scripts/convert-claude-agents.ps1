param(
  [string]$SourceDir = (Join-Path (Resolve-Path (Join-Path $PSScriptRoot '..')).Path 'agents\claude\wrkly'),
  [string]$DestinationDir = (Join-Path (Resolve-Path (Join-Path $PSScriptRoot '..')).Path 'agents\codex\wrkly'),
  [string]$NamePrefix = 'wrkly-',
  [switch]$Force
)

$ErrorActionPreference = 'Stop'

function Escape-TomlString([string]$Value) {
  return $Value.Replace('\', '\\').Replace('"', '\"').Replace("`r", '').Replace("`n", '\n')
}

if (!(Test-Path -LiteralPath $SourceDir)) {
  throw "Claude agent directory not found: $SourceDir"
}

New-Item -ItemType Directory -Path $DestinationDir -Force | Out-Null
$converted = 0

Get-ChildItem -LiteralPath $SourceDir -File -Filter '*.md' | Sort-Object Name | ForEach-Object {
  $raw = Get-Content -LiteralPath $_.FullName -Raw
  $name = $_.BaseName
  $description = "Converted Claude agent: $name"
  $body = $raw

  if ($raw -match '(?s)^\s*---\s*\r?\n(.*?)\r?\n---\s*\r?\n?(.*)$') {
    $frontmatter = $Matches[1]
    $body = $Matches[2].Trim()
    if ($frontmatter -match '(?m)^name:\s*(.+?)\s*$') {
      $name = $Matches[1].Trim().Trim('"', "'")
    }
    if ($frontmatter -match '(?m)^description:\s*(.+?)\s*$') {
      $description = $Matches[1].Trim().Trim('"', "'")
    }
  }

  $codexName = if ($name.StartsWith($NamePrefix)) { $name } else { "$NamePrefix$name" }
  $destination = Join-Path $DestinationDir "$codexName.toml"
  if ((Test-Path -LiteralPath $destination) -and !$Force) {
    Write-Output "Skip existing agent: $destination"
    return
  }

  if ($body.Contains("'''")) {
    throw "Cannot safely convert $($_.FullName): body contains TOML multiline literal delimiter."
  }

  $toml = @(
    "name = `"$(Escape-TomlString $codexName)`""
    "description = `"$(Escape-TomlString $description)`""
    "developer_instructions = '''"
    $body
    "'''"
    ''
  ) -join "`n"

  Set-Content -LiteralPath $destination -Value $toml -Encoding UTF8
  $converted++
  Write-Output "Converted $($_.Name) -> $codexName.toml"
}

Write-Output "Converted $converted Claude agents."

