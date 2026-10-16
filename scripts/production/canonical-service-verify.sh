#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He
# Confirm production service identity and a real SSH-2.0 banner, even when
# the freshly started, memory-constrained server needs a few bounded seconds.
set -Eeuo pipefail

service="$1"
repo="$2"
expected="$3"
virtual_ssh_port="$4"
virtual_ssh_probe="$5"

fail() {
	printf 'B"H CANONICAL_ACTIVATION_FAIL reason=%s\n' "$1" >&2
	exit 1
}

require_environment() {
	local value="$1"
	case " $service_environment " in
		*" $value "*) ;;
		*) fail "service_environment_missing_${value%%=*}" ;;
	esac
}

# A listener can start just before its SSH banner can be serviced. Never
# mistake one busy event-loop timeout for a broken release, but do not accept
# an occupied port, invalid banner or permanently stalled listener as ready.
verify_virtual_ssh() {
	local attempts="${AWTSMOOS_VIRTUAL_SSH_READY_ATTEMPTS:-8}"
	local delay="${AWTSMOOS_VIRTUAL_SSH_READY_DELAY_SECONDS:-1}"
	local attempt result
	[[ "$attempts" =~ ^[0-9]+$ ]] && [ "$attempts" -ge 1 ] && [ "$attempts" -le 20 ] \
		|| fail virtual_ssh_readiness_attempts_invalid
	[[ "$delay" =~ ^[0-9]+$ ]] && [ "$delay" -le 5 ] \
		|| fail virtual_ssh_readiness_delay_invalid
	for (( attempt=1; attempt<=attempts; attempt+=1 )); do
		if result="$(bash "$virtual_ssh_probe" "$virtual_ssh_port" 2>&1)"; then
			return 0
		fi
		case "$result" in
			*virtual_ssh_probe_invalid_banner*|*virtual_ssh_probe_banner_too_large*|\
			*virtual_ssh_probe_invalid_port*|*virtual_ssh_probe_invalid_timeout*|\
			*protocol_probe_missing*|*node_missing*)
				printf '%s\n' "$result" >&2
				fail virtual_ssh_protocol_probe_failed
				;;
		esac
		if [ "$attempt" -eq "$attempts" ]; then
			printf '%s\n' "$result" >&2
			fail virtual_ssh_protocol_probe_failed
		fi
		systemctl is-active --quiet "$service" || fail service_lost_during_virtual_ssh_probe
		printf 'B"H VIRTUAL_SSH_READINESS_RETRY attempt=%s/%s\n' "$attempt" "$attempts" >&2
		sleep "$delay"
	done
}

working_directory="$(systemctl show "$service" -p WorkingDirectory --value)"
exec_start="$(systemctl show "$service" -p ExecStart --value)"
service_environment="$(systemctl show "$service" -p Environment --value)"
[ "$working_directory" = "$repo" ] || fail service_working_directory_mismatch
case "$exec_start" in *"$repo/index.js"*) ;; *) fail service_exec_start_mismatch ;; esac
require_environment "VIRTUAL_SSH_HOST=0.0.0.0"
require_environment "VIRTUAL_SSH_PUBLIC_HOST=awtsmoos.com"
require_environment "VIRTUAL_SSH_PORT=$virtual_ssh_port"
require_environment "VIRTUAL_SSH_MAX_CONNECTIONS=64"
require_environment "VIRTUAL_SSH_CONNECTIONS_PER_MINUTE=60"
require_environment "VIRTUAL_SSH_IDLE_MS=1800000"
require_environment "VIRTUAL_SSH_TOKEN_TTL_MS=900000"
require_environment "AWTSMOOS_RELEASE_SHA=$expected"
verify_virtual_ssh
[ "$(git -C "$repo" rev-parse HEAD)" = "$expected" ] || fail post_restart_head_mismatch
[ -z "$(git -C "$repo" status --porcelain)" ] || fail post_restart_repo_dirty
