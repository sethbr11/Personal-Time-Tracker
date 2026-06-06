#!/bin/bash
# Load variables from .env
export $(sed 's/#.*//' .env | grep -v '^$' | xargs)

# Stop existing container if running
docker rm -f time-tracker 2>/dev/null

echo "🔒 Starting Time Tracker on Tailscale ($TAILSCALE_IP)..."

# Run with Tailscale IP binding
if docker run -d \
  -p $TAILSCALE_IP:8501:3001 \
  --name time-tracker \
  -v "$(pwd)/$CREDS_FILE":/app/$CREDS_FILE \
  -v "$(pwd)/.env":/app/.env \
  time-tracker > /dev/null 2>&1; then
  
  # Wait briefly for server initialization
  sleep 1
  
  if [ "$(docker inspect -f '{{.State.Running}}' time-tracker)" = "true" ]; then
    echo "✅ Secure! Access at http://$TAILSCALE_IP:8501"
  else
    echo "❌ Container started but crashed immediately. Run 'docker logs time-tracker' to debug."
    exit 1
  fi
else
  echo "❌ Failed to start container. Check if the image 'time-tracker' is built ('docker build -t time-tracker .'), Tailscale is up, and port 8501 is free."
  exit 1
fi