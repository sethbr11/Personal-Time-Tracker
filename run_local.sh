#!/bin/bash
# Load variables from .env
export $(sed 's/#.*//' .env | grep -v '^$' | xargs)

# Parse optional flags
BIND_IP="127.0.0.1"
MODE="local"

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --network) MODE="network"; shift ;;
        *) echo "Unknown parameter: $1"; exit 1 ;;
    esac
done

if [ "$MODE" = "network" ]; then
    # Detect the system's local network IP address
    # Works on macOS (ipconfig) and Linux (hostname -I or ip route)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        DETECTED_IP=$(ipconfig getifaddr $(route -n get default 2>/dev/null | awk '/interface:/{print $2}'))
    else
        DETECTED_IP=$(hostname -I | awk '{print $1}')
    fi

    if [ -n "$DETECTED_IP" ]; then
        BIND_IP="$DETECTED_IP"
        echo "🌐 Starting Time Tracker in NETWORK mode..."
    else
        echo "⚠️ Could not detect system IP. Falling back to local mode..."
        BIND_IP="127.0.0.1"
    fi
else
    echo "🚀 Starting Time Tracker in LOCAL mode..."
fi

# Stop existing container if running
docker rm -f time-tracker 2>/dev/null

# Run with target IP binding
if docker run -d \
  -p $BIND_IP:8501:3001 \
  --name time-tracker \
  -v "$(pwd)/$CREDS_FILE":/app/$CREDS_FILE \
  -v "$(pwd)/.env":/app/.env \
  time-tracker > /dev/null 2>&1; then
  
  # Wait briefly for server initialization
  sleep 1
  
  if [ "$(docker inspect -f '{{.State.Running}}' time-tracker)" = "true" ]; then
    echo "✅ Running! Access at http://$BIND_IP:8501"
    if [ "$MODE" = "network" ]; then
      echo "📱 Connect your phone on the same Wi-Fi using: http://$BIND_IP:8501"
    fi
  else
    echo "❌ Container started but crashed immediately. Run 'docker logs time-tracker' to debug."
    exit 1
  fi
else
  echo "❌ Failed to start container. Check if the image 'time-tracker' is built ('docker build -t time-tracker .') and port 8501 is free."
  exit 1
fi