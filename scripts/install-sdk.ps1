param(
  [switch]$All,
  [switch]$TypeScript,
  [switch]$Python,
  [string]$PythonExecutable
)

$ErrorActionPreference = 'Stop'
$Root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path

if (!$All -and !$TypeScript -and !$Python) {
  $TypeScript = $true
  $Python = $true
}
if ($All) {
  $TypeScript = $true
  $Python = $true
}

if ($TypeScript) {
  $node = Get-Command node -ErrorAction SilentlyContinue
  $npm = Get-Command npm -ErrorAction SilentlyContinue
  if (!$node -or !$npm) {
    throw 'Node.js and npm are required for the TypeScript Codex SDK.'
  }

  $major = [int]((& $node.Source --version).TrimStart('v').Split('.')[0])
  if ($major -lt 18) {
    throw "Node.js 18+ is required; found $(& $node.Source --version)."
  }

  Push-Location (Join-Path $Root 'sdk\typescript')
  try {
    & $npm.Source install
    if ($LASTEXITCODE -ne 0) { throw 'npm install failed.' }
    & $npm.Source run typecheck
    if ($LASTEXITCODE -ne 0) { throw 'TypeScript SDK typecheck failed.' }
  } finally {
    Pop-Location
  }
}

if ($Python) {
  $candidates = New-Object System.Collections.Generic.List[string]
  if ($PythonExecutable) {
    $candidates.Add($PythonExecutable)
  } else {
    $bundled = Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe'
    if (Test-Path -LiteralPath $bundled) {
      $candidates.Add($bundled)
    }

    $py = Get-Command py -ErrorAction SilentlyContinue
    if ($py) {
      foreach ($selector in @('-3.13', '-3.12', '-3.11', '-3.10')) {
        try {
          $path = & $py.Source $selector -c 'import sys; print(sys.executable)' 2>$null
          if ($LASTEXITCODE -eq 0 -and $path) {
            $candidates.Add($path.Trim())
          }
        } catch {
          continue
        }
      }
    }

    $pythonCommand = Get-Command python -ErrorAction SilentlyContinue
    if ($pythonCommand) {
      $candidates.Add($pythonCommand.Source)
    }
  }

  $selected = $null
  foreach ($candidate in ($candidates | Select-Object -Unique)) {
    if (!(Test-Path -LiteralPath $candidate)) { continue }
    $version = & $candidate -c 'import sys; print(sys.version_info.major * 100 + sys.version_info.minor)' 2>$null
    if ($LASTEXITCODE -ne 0) { continue }
    if ([int]$version.Trim() -ge 310) {
      $selected = $candidate
      break
    }
  }

  if (!$selected) {
    throw 'Python 3.10+ is required for the Python Codex SDK.'
  }

  $pythonRoot = Join-Path $Root 'sdk\python'
  $venv = Join-Path $pythonRoot '.venv'
  & $selected -m venv $venv
  if ($LASTEXITCODE -ne 0) { throw 'Python virtual environment creation failed.' }

  $venvPython = if ($IsWindows -or $env:OS -eq 'Windows_NT') {
    Join-Path $venv 'Scripts\python.exe'
  } else {
    Join-Path $venv 'bin/python'
  }

  & $venvPython -m pip install --upgrade pip
  if ($LASTEXITCODE -ne 0) { throw 'pip upgrade failed.' }
  & $venvPython -m pip install --pre -r (Join-Path $pythonRoot 'requirements.txt')
  if ($LASTEXITCODE -ne 0) { throw 'Python Codex SDK installation failed.' }
  & $venvPython -c 'from openai_codex import Codex; print(Codex)'
  if ($LASTEXITCODE -ne 0) { throw 'Python Codex SDK import failed.' }
}

Write-Output 'Codex SDK dependencies installed and verified.'
