# Load .env variables, handling quotes and comments
Get-Content .env | ForEach-Object {
    $line = $_.Trim()
    if ($line -and !$line.StartsWith("#")) {
        $lineWithoutComment = $line.Split('#')[0].Trim() # Remove inline comments
        if ($lineWithoutComment) {
            $key, $value = $lineWithoutComment.Split('=', 2)
            $key = $key.Trim()
            $value = $value.Trim().Trim('"')
            Set-Item -Path "env:$key" -Value $value
        }
    }
}

# Parse optional parameter
param (
    [switch]$Network
)

$BindIp = "127.0.0.1"

if ($Network) {
    # Detect the system's local IPv4 network address
    # Pulls active IPv4 matching typical local ranges (e.g. 192.168.x.x, 10.x.x.x)
    $ipAddresses = Get-NetIPAddress -AddressFamily IPv4 | Where-Object { 
        $_.IPAddress -notmatch "^127\." -and $_.IPAddress -notmatch "^169\.254\."
    }
    
    if ($ipAddresses) {
        $BindIp = $ipAddresses[0].IPAddress
        Write-Host "🌐 Starting Time Tracker in NETWORK mode..." -ForegroundColor Cyan
    } else {
        Write-Host "⚠️ Could not detect system IP. Falling back to local mode..." -ForegroundColor Yellow
    }
} else {
    Write-Host "🚀 Starting Time Tracker in LOCAL mode..." -ForegroundColor Cyan
}

# Stop existing container
$null = docker rm -f time-tracker 2>$null

# Run
$dockerResult = docker run -d `
  -p "${BindIp}:8501:3001" `
  --name time-tracker `
  -v "${PWD}/${env:CREDS_FILE}:/app/${env:CREDS_FILE}" `
  -v "${PWD}/.env:/app/.env" `
  time-tracker 2>$null

if ($LASTEXITCODE -eq 0) {
    Start-Sleep -Seconds 1
    $isRunning = docker inspect -f '{{.State.Running}}' time-tracker 2>$null
    if ($isRunning -eq "true") {
        Write-Host "✅ Running! Access at http://${BindIp}:8501" -ForegroundColor Green
        if ($Network) {
            Write-Host "📱 Connect your phone on the same Wi-Fi using: http://${BindIp}:8501" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ Container started but crashed immediately. Run 'docker logs time-tracker' to debug." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "❌ Failed to start container. Check if the image 'time-tracker' is built ('docker build -t time-tracker .') and port 8501 is free." -ForegroundColor Red
    exit 1
}
