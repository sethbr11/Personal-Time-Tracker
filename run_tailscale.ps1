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

Write-Host "🔒 Starting Time Tracker on Tailscale ($env:TAILSCALE_IP)..." -ForegroundColor Cyan

# Stop existing container
$null = docker rm -f time-tracker 2>$null

# Run
$dockerResult = docker run -d `
  -p "${env:TAILSCALE_IP}:8501:3001" `
  --name time-tracker `
  -v "${PWD}/${env:CREDS_FILE}:/app/${env:CREDS_FILE}" `
  -v "${PWD}/.env:/app/.env" `
  time-tracker 2>$null

if ($LASTEXITCODE -eq 0) {
    Start-Sleep -Seconds 1
    $isRunning = docker inspect -f '{{.State.Running}}' time-tracker 2>$null
    if ($isRunning -eq "true") {
        Write-Host "✅ Secure! Access at http://${env:TAILSCALE_IP}:8501" -ForegroundColor Green
    } else {
        Write-Host "❌ Container started but crashed immediately. Run 'docker logs time-tracker' to debug." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "❌ Failed to start container. Check if the image 'time-tracker' is built ('docker build -t time-tracker .'), Tailscale is up, and port 8501 is free." -ForegroundColor Red
    exit 1
}
