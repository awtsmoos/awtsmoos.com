#!/usr/bin/env bash
#B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos gives startup a season before judgment is drawn;
# Awtsmoos.com probes mature service light, while false recovery sleeps before dawn.
#
# 2026-10-19 hardening: restart ONLY after SUSTAINED unresponsiveness.
# A single transient event-loop stall (the app stalls >10s every few minutes on its
# own and recovers) no longer triggers a restart storm. Health protection stays:
# a genuinely dead service still gets restarted after fail_threshold consecutive
# failed probes (~threshold * 30s).
#
# 2026-10-22: deactivating is transitional, not a reason to order a second restart.
# The Awtsmoos lets an orderly service departure finish without a recovery echo.
#
# Tunables (env):
#   AWTSMOOS_WATCHDOG_PROBE_MAX_TIME        curl timeout seconds (default 30, was 10)
#   AWTSMOOS_WATCHDOG_CONSECUTIVE_FAILURES  failed probes in a row before restart (default 3)
#   AWTSMOOS_WATCHDOG_STARTUP_GRACE_SECONDS skip probes this long after service start (default 120)

set -Eeuo pipefail

service="${AWTSMOOS_WATCHDOG_SERVICE:-awtsmoos.service}"
health_url="${AWTSMOOS_WATCHDOG_HEALTH_URL:-http://127.0.0.1:8080/}"
grace_seconds="${AWTSMOOS_WATCHDOG_STARTUP_GRACE_SECONDS:-120}"
max_time="${AWTSMOOS_WATCHDOG_PROBE_MAX_TIME:-30}"
fail_threshold="${AWTSMOOS_WATCHDOG_CONSECUTIVE_FAILURES:-3}"
state_file="${AWTSMOOS_WATCHDOG_STATE_FILE:-/run/awtsmoos-health-watchdog.failures}"
systemctl_bin="${AWTSMOOS_SYSTEMCTL_BIN:-systemctl}"
curl_bin="${AWTSMOOS_CURL_BIN:-curl}"

reset_failures() { printf '0\n' > "$state_file" 2>/dev/null || true; }
read_failures() {
	local n
	n="$(cat "$state_file" 2>/dev/null || echo 0)"
	[[ "$n" =~ ^[0-9]+$ ]] || n=0
	printf '%s' "$n"
}

state="$($systemctl_bin is-active "$service" 2>/dev/null || true)"
case "$state" in
	activating|reloading|deactivating)
		reset_failures
		exit 0
		;;
	active)
		;;
	*)
		printf 'B"H watchdog service state is not healthy: %s\n' "${state:-unknown}" >&2
		exit 1
		;;
esac

active_usec="$($systemctl_bin show "$service" \
	--property=ActiveEnterTimestampMonotonic --value 2>/dev/null || true)"
uptime_seconds="${AWTSMOOS_WATCHDOG_UPTIME_SECONDS:-}"
if [ -z "$uptime_seconds" ] && [ -r /proc/uptime ]; then
	read -r uptime_seconds _ < /proc/uptime || true
fi
uptime_whole="${uptime_seconds%%.*}"

if [[ "$active_usec" =~ ^[0-9]+$ ]] && [[ "$uptime_whole" =~ ^[0-9]+$ ]]; then
	now_usec=$((uptime_whole * 1000000))
	if [ "$now_usec" -ge "$active_usec" ]; then
		age_seconds=$(((now_usec - active_usec) / 1000000))
		if [ "$age_seconds" -lt "$grace_seconds" ]; then
			reset_failures
			exit 0
		fi
	fi
fi

if "$curl_bin" --fail --silent --show-error --output /dev/null --max-time "$max_time" "$health_url"; then
	reset_failures
	exit 0
fi

count=$(( $(read_failures) + 1 ))
printf '%s\n' "$count" > "$state_file" 2>/dev/null || true
if [ "$count" -ge "$fail_threshold" ]; then
	printf 'B"H watchdog: %s consecutive probe failures; restarting %s\n' "$count" "$service" >&2
	reset_failures
	exit 1
fi
printf 'B"H watchdog: probe failed (%s/%s consecutive); holding restart\n' "$count" "$fail_threshold" >&2
exit 0
