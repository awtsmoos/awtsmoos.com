#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

set -Eeuo pipefail

ROOT="${AWTSMOOS_INSTALL_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)}"
LAUNCHCTL="${AWTSMOOS_LAUNCHCTL_BIN:-$(command -v launchctl || true)}"
PLUTIL="${AWTSMOOS_PLUTIL_BIN:-$(command -v plutil || true)}"
DOMAIN="gui/$(id -u)"

# The Awtsmoos gives the user one stable doorway while launchd keeps an internal
# root-hashed label. Awtsmoos.com repairs service custody without touching identity.
plist_value() {
	"$PLUTIL" -extract "$2" raw -o - "$1" 2>/dev/null || true
}

find_plist() {
	if [ -n "${AWTSMOOS_SERVICE_CLI_PLIST:-}" ]; then
		printf '%s\n' "$AWTSMOOS_SERVICE_CLI_PLIST"
		return 0
	fi
	local candidate="" candidate_root=""
	for candidate in "$HOME"/Library/LaunchAgents/com.awtsmoos.tunnel*.plist; do
		[ -f "$candidate" ] || continue
		candidate_root="$(plist_value "$candidate" EnvironmentVariables.AWTSMOOS_INSTALL_ROOT)"
		[ "$candidate_root" = "$ROOT" ] && {
			printf '%s\n' "$candidate"
			return 0
		}
	done
	return 1
}

service_context() {
	[ -n "$LAUNCHCTL" ] || { printf 'launchctl not found\n' >&2; return 1; }
	[ -n "$PLUTIL" ] || { printf 'plutil not found\n' >&2; return 1; }
	PLIST="$(find_plist)" || { printf 'Awtsmoos Tunnel LaunchAgent plist not found for %s\n' "$ROOT" >&2; return 1; }
	LABEL="$(plist_value "$PLIST" Label)"
	[ -n "$LABEL" ] || { printf 'LaunchAgent label missing in %s\n' "$PLIST" >&2; return 1; }
	export PLIST LABEL
}

loaded() {
	"$LAUNCHCTL" print "$DOMAIN/$LABEL" >/dev/null 2>&1
}

wait_loaded() {
	local attempt=0
	while [ "$attempt" -lt 40 ]; do loaded && return 0; sleep 0.125; attempt=$((attempt + 1)); done
	return 1
}

wait_unloaded() {
	local attempt=0
	while [ "$attempt" -lt 40 ]; do loaded || return 0; sleep 0.125; attempt=$((attempt + 1)); done
	return 1
}

start_service() {
	loaded || "$LAUNCHCTL" bootstrap "$DOMAIN" "$PLIST"
	"$LAUNCHCTL" enable "$DOMAIN/$LABEL" >/dev/null 2>&1 || true
	"$LAUNCHCTL" kickstart -k "$DOMAIN/$LABEL"
	wait_loaded || { printf 'LaunchAgent did not become loaded: %s\n' "$LABEL" >&2; return 1; }
}

restart_service() {
	"$LAUNCHCTL" bootout "$DOMAIN/$LABEL" >/dev/null 2>&1 ||
		"$LAUNCHCTL" bootout "$DOMAIN" "$PLIST" >/dev/null 2>&1 || true
	wait_unloaded || { printf 'LaunchAgent did not unload: %s\n' "$LABEL" >&2; return 1; }
	start_service
}

agent_ready() {
	local pid="$(cat "$ROOT/agent.pid" 2>/dev/null || true)"
	[ -n "$pid" ] && kill -0 "$pid" 2>/dev/null || return 1
	ps -p "$pid" -o command= 2>/dev/null | grep -Fq "$ROOT/awtsmoos-agent-launcher.cjs" || return 1
	grep -Eq '"state"[[:space:]]*:[[:space:]]*"registered"' "$ROOT/connection-state.json" 2>/dev/null
}

repair_service() {
	restart_service
	local attempt=0
	while [ "$attempt" -lt 80 ]; do agent_ready && return 0; sleep 0.25; attempt=$((attempt + 1)); done
	printf 'LaunchAgent loaded but tunnel did not register within 20 seconds. Run: %s logs\n' "$0" >&2
	return 1
}

status_service() {
	local state="unloaded" pid="$(cat "$ROOT/agent.pid" 2>/dev/null || true)"
	loaded && state="loaded"
	printf 'root=%s\nversion=%s\nplist=%s\nlabel=%s\nservice=%s\nagentPid=%s\n' \
		"$ROOT" "$(cat "$ROOT/install-state.txt" 2>/dev/null || printf unknown)" \
		"$PLIST" "$LABEL" "$state" "${pid:-missing}"
}

logs_service() {
	for file in "$ROOT/launchd.out.log" "$ROOT/launchd.err.log" \
		"${AWTSMOOS_RECOVERY_ROOT:-$HOME/.awtsmoos-tunnel-recovery}/logs/supervisor-recovery.log"; do
		[ -f "$file" ] && { printf '\n--- %s ---\n' "$file"; tail -n 80 "$file"; }
	done
}

service_context
case "${1:-status}" in
	status) status_service ;;
	start) start_service; status_service ;;
	restart) restart_service; status_service ;;
	repair) repair_service; status_service ;;
	logs) logs_service ;;
	*) printf 'usage: %s {status|start|restart|repair|logs}\n' "$0" >&2; exit 64 ;;
esac
