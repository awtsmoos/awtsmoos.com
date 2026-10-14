#!/bin/bash
# B"H — Yaakov 2026-10-14: completely kill the Awtsmoos tunnel supervisor and agent.
# Not dependent on Ctrl+C. Kills everything.
set -u

ROOT="${AWTSMOOS_INSTALL_ROOT:-$HOME/.awtsmoos/tunnel}"

echo "Killing Awtsmoos tunnel supervisor and agent..."

# Kill by PID file
if [ -f "$ROOT/supervisor.pid" ]; then
    pid=$(cat "$ROOT/supervisor.pid" 2>/dev/null || true)
    if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
        echo "Killing supervisor PID $pid"
        kill -TERM "$pid" 2>/dev/null || true
        sleep 2
        kill -KILL "$pid" 2>/dev/null || true
    fi
    rm -f "$ROOT/supervisor.pid"
fi

# Kill by process name
for pattern in "awtsmoos-supervisor" "awtsmoos-agent" "tunnel-agent"; do
    pids=$(pgrep -f "$pattern" 2>/dev/null || true)
    for pid in $pids; do
        echo "Killing $pattern PID $pid"
        kill -TERM "$pid" 2>/dev/null || true
    done
done
sleep 2
for pattern in "awtsmoos-supervisor" "awtsmoos-agent" "tunnel-agent"; do
    pids=$(pgrep -f "$pattern" 2>/dev/null || true)
    for pid in $pids; do
        kill -KILL "$pid" 2>/dev/null || true
    done
done

# Stop launchd service (macOS)
if command -v launchctl >/dev/null 2>&1; then
    launchctl unload ~/Library/LaunchAgents/com.awtsmoos.tunnel.plist 2>/dev/null || true
    rm -f ~/Library/LaunchAgents/com.awtsmoos.tunnel.plist
fi

# Stop systemd service (Linux)
if command -v systemctl >/dev/null 2>&1; then
    systemctl --user stop awtsmoos-tunnel 2>/dev/null || true
    rm -f ~/.config/systemd/user/awtsmoos-tunnel.service
fi

# Clean up
rm -f "$ROOT/stop-supervisor"
rm -f "$ROOT/supervisor.pid"

echo "✓ Tunnel supervisor and agent killed."
