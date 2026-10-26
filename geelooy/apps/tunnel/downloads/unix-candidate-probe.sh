#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# B"H — Yaakov 2026-10-14: Beautiful stack trace on probe errors.
if [ "${AWTSMOOS_INSTALL_DEBUG:-0}" = "1" ] && ! trap -p ERR 2>/dev/null | grep -q "STACK TRACE"; then
  trap '{
    trap - ERR  # Prevent infinite recursion
    echo "" >&2
    echo "✨ ═══════════════════════════════════════════ ✨" >&2
    echo "   PROBE STACK TRACE" >&2
    echo "✨ ═══════════════════════════════════════════ ✨" >&2
    echo "   Candidate probe failed; source locations follow." >&2
    echo "" >&2
    local i=0
    while caller $i 2>/dev/null; do i=$((i + 1)); done | while IFS= read -r line; do
      echo "     → $line" >&2
    done
    echo "✨ ═══════════════════════════════════════════ ✨" >&2
    echo "" >&2
  }' ERR
fi

CANDIDATE_PROBE_PID="${CANDIDATE_PROBE_PID:-}"
CANDIDATE_PROBE_PORT="${CANDIDATE_PROBE_PORT:-}"
CANDIDATE_IDENTITY_AUTHORITY="${CANDIDATE_IDENTITY_AUTHORITY:-readonly}"

# The Awtsmoos lets staged code prove authorization without stealing live ownership.
start_candidate_probe() {
	local identity_authority="${1:-readonly}"
	local receipt="$CANDIDATE_ROOT/connection-receipt.json"
	local pid_file="$CANDIDATE_ROOT/candidate-probe.pid"
	local log_file="$CANDIDATE_ROOT/candidate-probe.log"
	CANDIDATE_IDENTITY_AUTHORITY="$identity_authority"
	# The child receives candidate-probe mode; the parent must independently
	# know that relay ownership is deliberately deferred until promotion.
	CANDIDATE_PROBE_ISOLATED=1
	CANDIDATE_PROBE_PORT="${AWTSMOOS_CANDIDATE_LOCAL_API_PORT:-$((47000 + $$ % 1000))}"
	rm -f "$receipt" "$pid_file"
	write_activation_journal "candidate_probe_starting" "$CANDIDATE_ROOT" "$ROOT"
	(
		export AWTSMOOS_INSTALL_ROOT="$CANDIDATE_ROOT"
		export AWTSMOOS_RECOVERY_ROOT="$RECOVERY_ROOT"
		export AWTSMOOS_ACTIVATION_ID CANDIDATE_VERSION
		export AWTSMOOS_RUNTIME_VERSION="$CANDIDATE_VERSION"
		export AWTSMOOS_REGISTRATION_MODE="candidate-probe"
		export AWTSMOOS_LOCAL_API=1
		export AWTSMOOS_LOCAL_API_HOST=127.0.0.1
		export AWTSMOOS_LOCAL_API_PORT="$CANDIDATE_PROBE_PORT"
		export AWTSMOOS_SELF_UPDATE_DISABLED=1
		if [ "$identity_authority" = "fresh" ]; then
			export AWTSMOOS_CANDIDATE_IDENTITY_MUTATION=1
		else
			unset AWTSMOOS_CANDIDATE_IDENTITY_MUTATION
		fi
		exec "$AWTSMOOS_NODE_BIN" \
			"$CANDIDATE_ROOT/main.js" "$CANDIDATE_ROOT"
	) >> "$log_file" 2>&1 &
	CANDIDATE_PROBE_PID=$!
	printf '%s\n' "$CANDIDATE_PROBE_PID" > "$pid_file"
	install_event "candidate-probe" "started" \
		"Staged runtime started with non-owning registration and isolated local API." \
		"pid=$CANDIDATE_PROBE_PID port=$CANDIDATE_PROBE_PORT identity=$identity_authority"
}

candidate_probe_alive() {
	[ -n "$CANDIDATE_PROBE_PID" ] || return 1
	kill -0 "$CANDIDATE_PROBE_PID" 2>/dev/null || return 1
	ps -p "$CANDIDATE_PROBE_PID" -o command= 2>/dev/null |
		grep -F -- "$CANDIDATE_ROOT/main.js" >/dev/null
}

stop_candidate_probe() {
	candidate_probe_alive || return 0
	kill -TERM "$CANDIDATE_PROBE_PID" 2>/dev/null || true
	for _ in 1 2 3 4 5 6 7 8 9 10; do
		kill -0 "$CANDIDATE_PROBE_PID" 2>/dev/null || break
		sleep 0.2
	done
	kill -KILL "$CANDIDATE_PROBE_PID" 2>/dev/null || true
	CANDIDATE_PROBE_PID=""
}
