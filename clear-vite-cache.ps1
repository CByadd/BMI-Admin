# Clear Vite Cache Script
Write-Host "Clearing Vite cache..." -ForegroundColor Yellow

# Stop any running Node processes (optional - uncomment if needed)
# Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force

# Remove Vite cache directories
$viteCachePaths = @(
    "node_modules\.vite",
    ".vite"
)

foreach ($path in $viteCachePaths) {
    if (Test-Path $path) {
        Write-Host "Removing $path..." -ForegroundColor Cyan
        Remove-Item -Path $path -Recurse -Force -ErrorAction SilentlyContinue
        if (Test-Path $path) {
            Write-Host "Warning: Could not remove $path - it may be locked by another process" -ForegroundColor Red
        } else {
            Write-Host "Successfully removed $path" -ForegroundColor Green
        }
    } else {
        Write-Host "$path does not exist, skipping..." -ForegroundColor Gray
    }
}

Write-Host "`nCache cleared! You can now restart your dev server." -ForegroundColor Green
Write-Host "Run: npm run dev" -ForegroundColor Cyan





