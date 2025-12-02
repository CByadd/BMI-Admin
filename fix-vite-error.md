# Fix Vite EPERM Error

## Quick Fix Steps:

1. **Stop all running dev servers:**
   - Press `Ctrl+C` in any terminal running `npm run dev`
   - Or close all terminal windows

2. **Kill any remaining Node processes (if needed):**
   ```powershell
   Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force
   ```

3. **Clear Vite cache:**
   ```powershell
   Remove-Item -Path "node_modules\.vite" -Recurse -Force -ErrorAction SilentlyContinue
   ```

4. **Restart the dev server:**
   ```bash
   npm run dev
   ```

## Alternative Solutions:

### Option 1: Run as Administrator
- Right-click PowerShell/Command Prompt
- Select "Run as Administrator"
- Navigate to admin folder and run `npm run dev`

### Option 2: Check for File Locks
- Close VS Code or any IDE that might have the folder open
- Close any file explorers showing the admin folder
- Restart your computer if the issue persists

### Option 3: Delete node_modules and Reinstall
```powershell
Remove-Item -Path "node_modules" -Recurse -Force
npm install
npm run dev
```

## Prevention:
- Always stop the dev server (`Ctrl+C`) before closing the terminal
- Don't run multiple dev servers simultaneously
- Close file explorers when not needed















