#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

set -u

LAB="/Users/awtsmoos/work/awtsmoos-mitzvah-massive-lab"
EVIDENCE="$LAB/.evidence"
RESULT="$EVIDENCE/browser-proof.json"
STATUS="$EVIDENCE/browser-proof.exit"
SERVER_LOG="$EVIDENCE/browser-server-9364.log"
CHROME_LOG="$EVIDENCE/browser-chrome-9364.log"
PROFILE="$EVIDENCE/browser-profile-9364"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

mkdir -p "$EVIDENCE"
rm -f "$RESULT" "$STATUS" "$SERVER_LOG" "$CHROME_LOG"
rm -rf "$PROFILE"
cd "$LAB" || exit 90

python3 -m http.server 8364 \
	--bind 127.0.0.1 \
	--directory "$LAB/geelooy" >"$SERVER_LOG" 2>&1 &
SERVER_PID=$!
"$CHROME" \
	--headless=new \
	--disable-gpu \
	--disable-extensions \
	--disable-background-networking \
	--disable-background-timer-throttling \
	--disable-renderer-backgrounding \
	--no-first-run \
	--no-default-browser-check \
	--remote-debugging-port=9364 \
	--user-data-dir="$PROFILE" \
	--window-size=1280,900 \
	about:blank >"$CHROME_LOG" 2>&1 &
CHROME_PID=$!

cleanup() {
	kill "$CHROME_PID" "$SERVER_PID" 2>/dev/null || true
	wait "$CHROME_PID" 2>/dev/null || true
	wait "$SERVER_PID" 2>/dev/null || true
	rm -rf "$PROFILE"
}
trap cleanup EXIT

for attempt in $(seq 1 120); do
	if curl -sS http://127.0.0.1:8364/ >/dev/null 2>&1 \
		&& curl -sS http://127.0.0.1:9364/json/version >/dev/null 2>&1; then
		break
	fi
	sleep 0.25
done

if ! curl -sS http://127.0.0.1:8364/ >/dev/null 2>&1; then
	printf '91\n' >"$STATUS"
	exit 91
fi
if ! curl -sS http://127.0.0.1:9364/json/version >/dev/null 2>&1; then
	printf '92\n' >"$STATUS"
	exit 92
fi

node .evidence/browserProofClient.mjs >"$RESULT" 2>&1
EXIT_CODE=$?
printf '%s\n' "$EXIT_CODE" >"$STATUS"
exit "$EXIT_CODE"
