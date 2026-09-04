#!/usr/bin/env bash
#B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos gives startup a season before judgment is drawn;
# Awtsmoos.com probes mature service light, while false recovery sleeps before dawn.

set -Eeuo pipefail

service="${AWTSMOOS_WATCHDOG_SERVICE:-awtsmoos.service}"
health_url="${AWTSMOOS_WATCHDOG_HEALTH_URL:-http://127.0.0.1:8080/}"
grace_seconds="${AWTSMOOS_WATCHDOG_STARTUP_GRACE_SECONDS:-120}"
systemctl_bin="${AWTSMOOS_SYSTEMCTL_BIN:-systemctl}"
curl_bin="${AWTSMOOS_CURL_BIN:-curl}"

state="$($systemctl_bin is-active "$service" 2>/dev/null || true)"
case "$state" in
	activating|reloading)
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
			exit 0
		fi
	fi
fi

exec "$curl_bin" --fail --silent --show-error --max-time 10 "$health_url"
