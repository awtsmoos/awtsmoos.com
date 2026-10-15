#!/usr/bin/env bash
# B"H — Self-healing tunnel agent installer (Yaakov 2026-10-15)
# Sets up the systemd service for permanent, auto-restarting tunnel.
# Run as root on the server.

set -euo pipefail

INSTALL_DIR="/root/simple-tunnel-agent"
SERVICE_FILE="/etc/systemd/system/simple-tunnel-agent.service"
BASE_URL="https://awtsmoos.com/api/tunnel/control/lanes/simple"

echo "B\"H — Installing self-healing tunnel agent..."

# B"H — Create directory
mkdir -p "$INSTALL_DIR"

# B"H — Download agent files
echo "Downloading agent files..."
curl -fsSL "$BASE_URL/agent-resilient.js" -o "$INSTALL_DIR/agent-resilient.js"
curl -fsSL "$BASE_URL/agent-poll.js" -o "$INSTALL_DIR/agent-poll.js"
curl -fsSL "$BASE_URL/agent-websocket.js" -o "$INSTALL_DIR/agent-websocket.js"

# B"H — Get secret (from env or prompt)
if [ -z "${TUNNEL_SECRET:-}" ]; then
  echo ""
  echo "Enter tunnel secret:"
  read -rs TUNNEL_SECRET
  echo ""
fi
if [ -z "$TUNNEL_SECRET" ]; then
  echo "ERROR: TUNNEL_SECRET is required" >&2
  exit 1
fi

AGENT_ID="${TUNNEL_AGENT_ID:-$(hostname)}"

# B"H — Write systemd service
cat > "$SERVICE_FILE" << EOF
[Unit]
Description=Awtsmoos Self-Healing Tunnel Agent
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=root
WorkingDirectory=$INSTALL_DIR
ExecStart=/usr/bin/node $INSTALL_DIR/agent-resilient.js
Restart=always
RestartSec=5
Environment=TUNNEL_SERVER=https://awtsmoos.com
Environment=TUNNEL_AGENT_ID=$AGENT_ID
Environment=TUNNEL_SECRET=$TUNNEL_SECRET
Environment=TUNNEL_AGENT_FILE=$INSTALL_DIR/agent-poll.js
StandardOutput=journal
StandardError=journal
SyslogIdentifier=tunnel-agent

[Install]
WantedBy=multi-user.target
EOF

# B"H — Enable and start
systemctl daemon-reload
systemctl enable simple-tunnel-agent.service
systemctl restart simple-tunnel-agent.service

echo ""
echo "✓ Self-healing tunnel installed"
echo "  Agent ID: $AGENT_ID"
echo "  Status: $(systemctl is-active simple-tunnel-agent.service)"
echo ""
echo "Commands:"
echo "  Status:  systemctl status simple-tunnel-agent.service"
echo "  Logs:    journalctl -u simple-tunnel-agent.service -f"
echo "  Restart: systemctl restart simple-tunnel-agent.service"
echo "  Stop:    systemctl stop simple-tunnel-agent.service"
