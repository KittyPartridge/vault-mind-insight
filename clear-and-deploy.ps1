# Script to clear test data and deploy fresh contracts
Write-Host "=== Clearing Test Data and Deploying Fresh Contracts ===" -ForegroundColor Green
Write-Host ""

# Step 1: Stop Hardhat node
Write-Host "Step 1: Stopping Hardhat node processes..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    $nodeProcesses | Stop-Process -Force -ErrorAction SilentlyContinue
    Write-Host "  Stopped $($nodeProcesses.Count) process(es)" -ForegroundColor Gray
    Start-Sleep -Seconds 2
} else {
    Write-Host "  No node processes found" -ForegroundColor Gray
}

# Step 2: Clear deployment files
Write-Host ""
Write-Host "Step 2: Clearing deployment files..." -ForegroundColor Yellow
if (Test-Path "deployments\localhost") {
    $files = Get-ChildItem -Path "deployments\localhost" -Filter "*.json" -Exclude "solcInputs"
    if ($files) {
        $files | Remove-Item -Force
        Write-Host "  Removed $($files.Count) deployment file(s)" -ForegroundColor Gray
    } else {
        Write-Host "  No deployment files to remove" -ForegroundColor Gray
    }
} else {
    Write-Host "  No deployments directory found" -ForegroundColor Gray
}

# Step 3: Wait
Write-Host ""
Write-Host "Step 3: Waiting..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

# Step 4: Instructions
Write-Host ""
Write-Host "=== Next Steps ===" -ForegroundColor Green
Write-Host ""
Write-Host "1. Open a NEW terminal and start Hardhat node:" -ForegroundColor Cyan
Write-Host "   npx hardhat node" -ForegroundColor White
Write-Host ""
Write-Host "2. Wait for 'Started HTTP and WebSocket JSON-RPC server' message" -ForegroundColor Yellow
Write-Host ""
Write-Host "3. In THIS terminal, run:" -ForegroundColor Cyan
Write-Host "   npx hardhat deploy --network localhost" -ForegroundColor White
Write-Host ""
Write-Host "4. Copy the MoodScoreTest contract address from the output" -ForegroundColor Yellow
Write-Host ""
Write-Host "5. Update ui/src/config/contract.ts with the new address" -ForegroundColor Yellow
Write-Host ""
Write-Host "6. Refresh your browser - all test data is now cleared!" -ForegroundColor Green
Write-Host ""

