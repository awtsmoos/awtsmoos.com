#!/bin/bash
# B"H — CPU 60fps bench helper. Restarts the daemon fresh (pages die after
# heavy SwiftShader benches), then runs one /bench and prints the result.
# Usage: bench-cpu.sh '<json-body>'
set -u
HERE="$(dirname "$0")/.."
cd "$HERE" || exit 1
fuser -k 19311/tcp 2>/dev/null
sleep 5
rm -f /tmp/reality-daemon.port
(setsid node reality-daemon.mjs > /tmp/reality-daemon.log 2>&1 < /dev/null &)
for i in $(seq 1 12); do
  sleep 10
  if [ -f /tmp/reality-daemon.port ]; then
    P=$(cat /tmp/reality-daemon.port)
    if curl -s -m 5 "http://127.0.0.1:$P/health" | grep -q '"ok":true'; then
      echo "daemon up port=$P" >&2
      break
    fi
  fi
done
P=$(cat /tmp/reality-daemon.port)
curl -s -m 900 -X POST "http://127.0.0.1:$P/bench" -H 'Content-Type: application/json' -d "$1"
echo
