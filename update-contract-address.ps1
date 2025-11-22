# Script to update contract address in ui/src/config/contract.ts
param(
    [Parameter(Mandatory=$true)]
    [string]$ContractAddress
)

$contractTsPath = "ui\src\config\contract.ts"

if (-not (Test-Path $contractTsPath)) {
    Write-Host "Error: contract.ts file not found at $contractTsPath" -ForegroundColor Red
    exit 1
}

Write-Host "Updating contract address to: $ContractAddress" -ForegroundColor Yellow

$content = Get-Content $contractTsPath -Raw
$pattern = 'const LOCALHOST_CONTRACT_ADDRESS = "0x[a-fA-F0-9]+"'
$replacement = "const LOCALHOST_CONTRACT_ADDRESS = `"$ContractAddress`""

if ($content -match $pattern) {
    $newContent = $content -replace $pattern, $replacement
    Set-Content -Path $contractTsPath -Value $newContent -NoNewline
    Write-Host "✓ Contract address updated successfully!" -ForegroundColor Green
} else {
    Write-Host "Warning: Could not find LOCALHOST_CONTRACT_ADDRESS in contract.ts" -ForegroundColor Yellow
    Write-Host "Please update manually" -ForegroundColor Yellow
}

