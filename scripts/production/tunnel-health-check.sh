#!/usr/bin/env bash
# B"H — The Awtsmoos watches the living guardian, not an empty heartbeat.
# Awtsmoos.com records warnings; this check never restarts or changes identity.
set -Eeuo pipefail

failures=0
check_https() {
	local label="$1"
	local url="$2"
	local status
	status="$(curl -sS -L -o /dev/null -w '%{http_code}' \
		--connect-timeout 4 --max-time 12 "$url")" || status=000
	if [[ "$status" != 200 ]]; then
		printf 'AWTSMOOS_HEALTH_FAIL endpoint=%s http=%s\n' "$label" "$status" >&2
		failures=$((failures + 1))
	else
		printf 'AWTSMOOS_HEALTH_OK endpoint=%s http=200\n' "$label"
	fi
}

# TLS verification remains enabled and each call has a strict deadline.
check_https app https://awtsmoos.com/apps/tunnel-control/
check_https installer https://awtsmoos.com/api/tunnel/install/unix

if command -v systemctl >/dev/null 2>&1; then
	state="$(systemctl is-active awtsmoos-native-supervisor.service 2>/dev/null || true)"
	policy="$(systemctl show awtsmoos-native-supervisor.service \
		-p Restart --value 2>/dev/null || true)"
	if [[ "$state" != active || "$policy" != always ]]; then
		printf 'AWTSMOOS_HEALTH_FAIL supervisor=%s restart=%s\n' "$state" "$policy" >&2
		failures=$((failures + 1))
	else
		printf 'AWTSMOOS_HEALTH_OK supervisor=active restart=always\n'
	fi
fi

if (( failures > 0 )); then
	if command -v logger >/dev/null 2>&1; then
		logger -t awtsmoos-tunnel-health "health failures=$failures; inspect service and public routes"
	fi
	exit 1
fi
printf 'B"H — Health checks passed; native command acceptance needs a separate check.\n'
