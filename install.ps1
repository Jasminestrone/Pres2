# Check if running as administrator
if (-NOT ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Warning "Please run this script as Administrator!"
    exit
}

# Function to check if a command exists
function Test-Command($cmdname) {
    return [bool](Get-Command -Name $cmdname -ErrorAction SilentlyContinue)
}

$availableModels = @{
    "DeepSeek-R1-Distill-Qwen-1.5B" = "3.2GB on disk | ~4GB RAM"
    "DeepSeek-R1-Distill-Qwen-7B" = "14GB on disk | ~16GB RAM"
    "DeepSeek-R1-Distill-Qwen-14B" = "28GB on disk | ~32GB RAM"
}

# Display model options with disk space requirements
Write-Host "`nAvailable Models (with disk space requirements):"
Write-Host "----------------------------------------"
foreach ($model in $availableModels.GetEnumerator()) {
    Write-Host "$($model.Key) (Required disk space: $($model.Value))"
}

# Get user model selection
$selectedModel = Read-Host "`nPlease select a model (enter the exact name)"

if (-not $availableModels.ContainsKey($selectedModel)) {
    Write-Host "Invalid model selection. Using default model: DeepSeek-R1-Distill-Qwen-1.5B"
    $selectedModel = "DeepSeek-R1-Distill-Qwen-1.5B"
}

# Check and install Python 3.13 (auto-detect system architecture)
if (-not (Test-Command python)) {
    Write-Host "Python not found. Installing Python 3.13..."

    # Detect system architecture
    $arch = (Get-CimInstance Win32_OperatingSystem).OSArchitecture
    if ($arch -like "*64*") {
        $pythonUrl = "https://www.python.org/ftp/python/3.13.0/python-3.13.0-amd64.exe"
    } else {
        $pythonUrl = "https://www.python.org/ftp/python/3.13.0/python-3.13.0.exe"
    }

    $pythonInstaller = "$env:TEMP\python-installer.exe"
    Invoke-WebRequest -Uri $pythonUrl -OutFile $pythonInstaller

    # Install Python 3.13 silently, add to PATH
    Start-Process -FilePath $pythonInstaller -ArgumentList "/quiet", "InstallAllUsers=1", "PrependPath=1" -Wait
    Remove-Item $pythonInstaller

    # Refresh environment variables for the current session
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
}

# Check and install Node.js
if (-not (Test-Command node)) {
    Write-Host "Node.js not found. Installing Node.js..."
    $nodeUrl = "https://nodejs.org/dist/v20.11.1/node-v20.11.1-x64.msi"
    $nodeInstaller = "$env:TEMP\node-installer.msi"
    Invoke-WebRequest -Uri $nodeUrl -OutFile $nodeInstaller
    Start-Process -FilePath "msiexec.exe" -ArgumentList "/i", $nodeInstaller, "/quiet", "/norestart" -Wait
    Remove-Item $nodeInstaller
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
}

# Install Python requirements
Write-Host "Installing Python requirements..."
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

# Install Node.js requirements
Write-Host "Installing Node.js requirements..."
npm install

# Update process_text.py with the selected model
$modelConfig = $selectedModel
$configContent = @"
# Model configuration
MODEL_NAME = "$selectedModel"
"@
Set-Content -Path "model_config.py" -Value $configContent

# Load Chrome extension
Write-Host "`nTo load the extension in Chrome:"
Write-Host "1. Open Chrome and go to chrome://extensions/"
Write-Host "2. Enable 'Developer mode' in the top right"
Write-Host "3. Click 'Load unpacked' and select the extension directory"
Write-Host "4. The extension should now be installed!"

# Start the server
Write-Host "`nStarting the server..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "node server.js"

Write-Host "`nInstallation complete! The extension is ready to use." 