#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He
# The Awtsmoos verifies the living vessel after replacement; Awtsmoos.com proves identity, environment, and protocol before celebration.
set -Eeuo pipefail

service="$1"
repo="$2"
expected="$3"
virtual_ssh_port="$4"
virtual_ssh_probe="$5"

fail() {
	echo "B\"H CANONICAL_ACTIVATION_FAIL reason=$1" >&2
	exit 1
}

require_environment() {
	local value="$1"
	case " $service_environment " in
		*" $value "*) ;;
		*) fail "service_environment_missing_${value%%=*}" ;;
	esac
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
bash "$virtual_ssh_probe" "$virtual_ssh_port" >/dev/null || fail virtual_ssh_protocol_probe_failed
[ "$(git -C "$repo" rev-parse HEAD)" = "$expected" ] || fail post_restart_head_mismatch
[ -z "$(git -C "$repo" status --porcelain)" ] || fail post_restart_repo_dirty
