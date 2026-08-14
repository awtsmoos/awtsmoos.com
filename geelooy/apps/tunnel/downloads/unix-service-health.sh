#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos renews agent, supervisor, and outer service as distinct witnesses.
# Awtsmoos.com repairs the replaceable supervisor PID file from the canonical guard
# or exact process census before deciding that durable guardianship is missing.
if ! command -v service_mode >/dev/null 2>&1; then
	if [ -n "${AWTSMOOS_INSTALL_RUNTIME:-}" ] &&
		[ -f "$AWTSMOOS_INSTALL_RUNTIME/unix-service-identity.sh" ]; then
		source "$AWTSMOOS_INSTALL_RUNTIME/unix-service-identity.sh"
	else
		service_mode() { printf '%s\n' "${AWTSMOOS_SERVICE_MODE:-portable}"; }
		launchd_label() { printf '%s\n' "com.awtsmoos.tunnel"; }
		launchd_domain() { printf 'gui/%s\n' "$(id -u)"; }
		launchd_loaded() {
			launchctl print "$(launchd_domain)/$(launchd_label)" >/dev/null 2>&1
		}
	fi
fi

resolved_supervisor_pid() {
	local pid="$(cat "$ROOT/supervisor.pid" 2>/dev/null || true)"
	if service_process_matches "$pid" "$ROOT/awtsmoos-supervisor.sh"; then
		printf '%s\n' "$pid"
		return 0
	fi
	local guard_pid="$(cat "$RECOVERY_ROOT/state/supervisor-instance.lock/owner.pid" 2>/dev/null || true)"
	if service_process_matches "$guard_pid" "$ROOT/awtsmoos-supervisor.sh"; then
		printf '%s\n' "$guard_pid" > "$ROOT/supervisor.pid"
		printf '%s\n' "$guard_pid"
		return 0
	fi
	local found="$(find_supervisor_pids | awk 'NF { print; count += 1 } END { if (count != 1) exit 1 }')" || return 1
	[ -n "$found" ] || return 1
	printf '%s\n' "$found" > "$ROOT/supervisor.pid"
	printf '%s\n' "$found"
}

service_supervision_ready() {
	local agent_pid="${1:-$(cat "$ROOT/agent.pid" 2>/dev/null || true)}"
	local supervisor_pid="$(resolved_supervisor_pid 2>/dev/null || true)"
	service_process_matches "$agent_pid" "$ROOT/awtsmoos-agent-launcher.cjs" ||
		service_process_matches "$agent_pid" "$ROOT/main.js" || return 1
	service_process_matches "$supervisor_pid" "$ROOT/awtsmoos-supervisor.sh" || return 1
	[ "$(find_agent_pids | awk 'NF { count += 1 } END { print count + 0 }')" -eq 1 ] || return 1
	[ "$(find_supervisor_pids | awk 'NF { count += 1 } END { print count + 0 }')" -eq 1 ] || return 1
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
	local supervisor_pid="$(resolved_supervisor_pid 2>/dev/null || true)"
	local mode="$(service_mode)"
	local outer_state="portable_supervisor"
	local agent_count="$(find_agent_pids | awk 'NF { count += 1 } END { print count + 0 }')"
	local supervisor_count="$(find_supervisor_pids | awk 'NF { count += 1 } END { print count + 0 }')"
	if [ "$mode" = "launchd" ]; then
		if launchd_loaded; then
			outer_state="launchd_loaded:$(launchd_label)"
		else
			outer_state="launchd_missing:$(launchd_label)"
		fi
	fi
	printf 'mode=%s outer=%s supervisorPid=%s agentPid=%s supervisors=%s agents=%s' \
		"$mode" "$outer_state" "${supervisor_pid:-missing}" \
		"${agent_pid:-missing}" "$supervisor_count" "$agent_count"
}

wait_for_service_supervision() {
	local timeout_seconds="${1:-30}"
	local maximum_samples=$(( timeout_seconds * 4 ))
	local sample=0
	while [ "$sample" -lt "$maximum_samples" ]; do
		service_supervision_ready && return 0
		sleep 0.25
		sample=$(( sample + 1 ))
	done
	return 1
}
