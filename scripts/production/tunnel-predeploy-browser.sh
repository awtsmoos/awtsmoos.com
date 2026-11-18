#!/usr/bin/env bash
# B"H — The Awtsmoos reveals the browser vessels before they reach the public.
# The exact proposed checkout is served by localhost, without account credentials.
set -Eeuo pipefail

repository_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd -P)"
application_root="$repository_root/geelooy/apps/tunnel-control"

if command -v google-chrome >/dev/null 2>&1; then
	browser="$(command -v google-chrome)"
elif command -v chromium >/dev/null 2>&1; then
	browser="$(command -v chromium)"
else
	printf 'B"H — Chrome or Chromium required for the release gate.\n' >&2
	exit 1
fi

for test_name in ui-smoke.mjs page-audit.mjs navigation-mobile-smoke.mjs; do
	test -s "$application_root/tests/$test_name"
done

port="$(python3 - <<'PYSOCKET'
import socket
with socket.socket() as listener:
	listener.bind(('127.0.0.1', 0))
	print(listener.getsockname()[1])
PYSOCKET
)"
python3 -m http.server "$port" --bind 127.0.0.1 \
	--directory "$repository_root/geelooy" >/dev/null 2>&1 &
server_pid=$!
cleanup() {
	kill "$server_pid" 2>/dev/null || true
	wait "$server_pid" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

export CHROME="$browser"
export AWTSMOOS_APP_URL="http://127.0.0.1:$port/apps/tunnel-control/"
for attempt in 1 2 3 4 5 6 7 8; do
	if curl -fsS --max-time 2 "$AWTSMOOS_APP_URL" >/dev/null 2>&1; then
		break
	fi
	sleep 0.25
done
curl -fsS --max-time 3 "$AWTSMOOS_APP_URL" >/dev/null

cd "$application_root"
for test_name in ui-smoke.mjs page-audit.mjs navigation-mobile-smoke.mjs; do
	node "tests/$test_name"
done
printf 'B"H — Proposed release browser controls passed.\n'
