# PowerShell script to start Hardhat node and deploy contracts
# This script starts the Hardhat node in the background and deploys contracts

Write-Host "Starting Hardhat node with FHEVM support..." -ForegroundColor Green

# Start Hardhat node in background
$nodeProcess = Start-Process -FilePath "npx" -ArgumentList "hardhat", "node" -NoNewWindow -PassThru

Write-Host "Waiting for Hardhat node to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host "Deploying contracts to localhost..." -ForegroundColor Green
npx hardhat deploy --network localhost

Write-Host "`nHardhat node is running (PID: $($nodeProcess.Id))" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. The contract address is shown above"
Write-Host "2. Update ui/src/config/contract.ts with the deployed address"
Write-Host "3. Start frontend: cd ui && npm run dev"
Write-Host "`nTo stop the Hardhat node, run: Stop-Process -Id $($nodeProcess.Id)" -ForegroundColor Cyan

