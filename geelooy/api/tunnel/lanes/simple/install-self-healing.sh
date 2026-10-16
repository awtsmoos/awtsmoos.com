#!/usr/bin/env bash
# B"H — Self-healing tunnel agent installer (Yaakov 2026-10-15)
# Sets up the systemd service for permanent, auto-restarting tunnel.
# Run as root on the server.

set -euo pipefail

INSTALL_DIR="/opt/awtsmoos-simple-agent"
SERVICE_FILE="/etc/systemd/system/simple-tunnel-agent.service"
BASE_URL="https://awtsmoos.com/api/tunnel/control/lanes/simple"

echo "B\"H — Installing self-healing tunnel agent..."

# B"H — Create directory
mkdir -p "$INSTALL_DIR"

# B"H — Download agent files
echo "Downloading agent files..."
curl -fsSL "$BASE_URL/agent-resilient.js" -o "$INSTALL_DIR/agent-resilient.js"
curl -fsSL "$BASE_URL/agent-poll.js" -o "$INSTALL_DIR/agent-poll.js"
curl -fsSL "$BASE_URL/agent-command-policy.js" -o "$INSTALL_DIR/agent-command-policy.js"
curl -fsSL "$BASE_URL/agent-websocket.js" -o "$INSTALL_DIR/agent-websocket.js"

# The agent gets its private credential from systemd credential delivery.
# Never write a secret into a world-readable unit file, shell history or URL.
AGENT_ID="${TUNNEL_AGENT_ID:-$(hostname)}"
[[ "$AGENT_ID" =~ ^[a-zA-Z0-9._-]{1,100}$ ]] || { echo "Invalid agent ID" >&2; exit 1; }
[ -f /etc/awtsmoos/simple-agent.key ] || { echo "Missing configured agent master key" >&2; exit 1; }
DEVICE_KEY="/etc/awtsmoos/simple-agent-${AGENT_ID}.key"
TUNNEL_AGENT_ID="$AGENT_ID" DEVICE_KEY="$DEVICE_KEY" /usr/bin/node - <<'NODE'
const fs = require("node:fs");
const crypto = require("node:crypto");
const master = fs.readFileSync("/etc/awtsmoos/simple-agent.key", "utf8").trim();
if (master.length < 32) process.exit(2);
const id = process.env.TUNNEL_AGENT_ID;
const key = crypto.createHmac("sha256", master).update(`awtsmoos-simple-agent:${id}`).digest("hex");
fs.writeFileSync(process.env.DEVICE_KEY, key + "\n", { mode: 0o600 });
NODE

cat > "$SERVICE_FILE" << EOF
[Unit]
Description=Awtsmoos Secure Simple Tunnel Agent
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
DynamicUser=yes
WorkingDirectory=$INSTALL_DIR
ExecStart=/usr/bin/node $INSTALL_DIR/agent-resilient.js
Restart=always
RestartSec=5
Environment=TUNNEL_SERVER=https://awtsmoos.com
Environment=TUNNEL_AGENT_ID=$AGENT_ID
Environment=TUNNEL_AGENT_FILE=$INSTALL_DIR/agent-poll.js
LoadCredential=simple-agent.key:$DEVICE_KEY
NoNewPrivileges=yes
ProtectSystem=strict
ProtectHome=yes
PrivateTmp=yes
PrivateDevices=yes
RestrictAddressFamilies=AF_INET AF_INET6 AF_UNIX
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
