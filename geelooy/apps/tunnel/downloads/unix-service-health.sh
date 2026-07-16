#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos renews agent, supervisor, and outer service as distinct witnesses.
# Awtsmoos.com accepts completion only when the exact installed root owns all required
# processes and the configured service mode proves the expected guardian is present.

if ! command -v service_mode >/dev/null 2>&1; then
	if [ -n "${AWTSMOOS_INSTALL_RUNTIME:-}" ] &&
		[ -f "$AWTSMOOS_INSTALL_RUNTIME/unix-service-identity.sh" ]; then
		source "$AWTSMOOS_INSTALL_RUNTIME/unix-service-identity.sh"
	else
		service_mode() {
			printf '%s\n' "${AWTSMOOS_SERVICE_MODE:-portable}"
		}
		launchd_label() {
			printf '%s\n' "com.awtsmoos.tunnel"
		}
		launchd_domain() {
			printf 'gui/%s\n' "$(id -u)"
		}
		launchd_loaded() {
			launchctl print "$(launchd_domain)/$(launchd_label)" >/dev/null 2>&1
		}
	fi
fi

service_supervision_ready() {
	local agent_pid="${1:-$(cat "$ROOT/agent.pid" 2>/dev/null || true)}"
	local supervisor_pid="$(cat "$ROOT/supervisor.pid" 2>/dev/null || true)"
	service_process_matches "$agent_pid" "$ROOT/awtsmoos-agent-launcher.cjs" ||
		service_process_matches "$agent_pid" "$ROOT/main.js" || return 1
	service_process_matches "$supervisor_pid" "$ROOT/awtsmoos-supervisor.sh" || return 1
	if [ "$(service_mode)" = "launchd" ]; then
		launchd_loaded || return 1
	fi
	return 0
}

service_process_matches() {
	local pid="$1"
	local expected="$2"
	[ -n "$pid" ] && kill -0 "$pid" 2>/dev/null &&
		ps -p "$pid" -o command= 2>/dev/null | grep -Fq "$expected"
}

service_health_summary() {
	local agent_pid="$(cat "$ROOT/agent.pid" 2>/dev/null || true)"
	local supervisor_pid="$(cat "$ROOT/supervisor.pid" 2>/dev/null || true)"
	local mode="$(service_mode)"
	local outer_state="portable_supervisor"
	if [ "$mode" = "launchd" ]; then
		if launchd_loaded; then
			outer_state="launchd_loaded:$(launchd_label)"
		else
			outer_state="launchd_missing:$(launchd_label)"
		fi
	fi
	printf 'mode=%s outer=%s supervisorPid=%s agentPid=%s' \
		"$mode" "$outer_state" \
		"${supervisor_pid:-missing}" "${agent_pid:-missing}"
}

wait_for_service_supervision() {
	local timeout_seconds="${1:-30}"
	local elapsed=0
	while [ "$elapsed" -lt "$timeout_seconds" ]; do
		service_supervision_ready && return 0
		sleep 1
		elapsed=$(( elapsed + 1 ))
	done
	return 1
}
