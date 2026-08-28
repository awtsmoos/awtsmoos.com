#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He
# The Awtsmoos reveals one canonical server beneath changing process garments;
# Awtsmoos.com proves source, runtime, living SSH protocol, and warmed compact vessels before release light may rhyme.
set -Eeuo pipefail

expected="${1:-}"
repo="${AWTSMOOS_PRODUCTION_REPO:-/mnt/HC_Volume_102267213/git/awtsmoos.com}"
service="${AWTSMOOS_PRODUCTION_SERVICE:-awtsmoos.service}"
override="${AWTSMOOS_SYSTEMD_OVERRIDE_PATH:-/etc/systemd/system/${service}.d/10-immutable-release.conf}"
source_override="$repo/ops/systemd/awtsmoos-immutable.conf"
health_url="${AWTSMOOS_PRODUCTION_HEALTH_URL:-http://127.0.0.1:8080/}"
prewarm_base="${AWTSMOOS_COMPACT_PREWARM_BASE_URL:-http://127.0.0.1:8080}"
extension_builder="$repo/geelooy/ai/scripts/buildServerExtensionZip.cjs"
extension_artifact="$repo/geelooy/ai/relay/install/awtsmoos-server-extension.zip"
script_directory="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
virtual_ssh_probe="$script_directory/virtual-ssh-listener-probe.sh"
prewarm_script="$script_directory/prewarm-compact-assets.sh"
virtual_ssh_port="${AWTSMOOS_VIRTUAL_SSH_PORT:-2223}"
backup="${TMPDIR:-/tmp}/awtsmoos-service-override.$$.bak"
armed=0
committed=0
had_override=0

fail() {
	echo "B\"H CANONICAL_ACTIVATION_FAIL reason=$1" >&2
	exit 1
}

rollback() {
	[ "$armed" -eq 1 ] || return 0
	[ "$committed" -eq 0 ] || return 0
	if [ "$had_override" -eq 1 ] && [ -f "$backup" ]; then
		install -D -m 0644 "$backup" "$override" || true
	else
		rm -f "$override" || true
	fi
	systemctl daemon-reload || true
	systemctl restart "$service" || true
}

require_environment() {
	local value="$1"
	case " $service_environment " in
		*" $value "*) ;;
		*) fail "service_environment_missing_${value%%=*}" ;;
	esac
}

trap rollback EXIT
[[ "$expected" =~ ^[0-9a-f]{40}$ ]] || fail invalid_expected_sha
[[ "$virtual_ssh_port" =~ ^[0-9]+$ ]] || fail invalid_virtual_ssh_port
[ "$virtual_ssh_port" -ge 1 ] || fail invalid_virtual_ssh_port
[ "$virtual_ssh_port" -le 65535 ] || fail invalid_virtual_ssh_port
[ -d "$repo/.git" ] || fail canonical_repo_missing
[ "$(git -C "$repo" branch --show-current)" = "main" ] || fail canonical_repo_not_main
[ -z "$(git -C "$repo" status --porcelain)" ] || fail canonical_repo_dirty
[ "$(git -C "$repo" rev-parse HEAD)" = "$expected" ] || fail canonical_head_mismatch
[ "$(git -C "$repo" rev-parse origin/main)" = "$expected" ] || fail canonical_origin_mismatch
[ -f "$source_override" ] || fail canonical_override_missing
[ -f "$repo/index.js" ] || fail canonical_entrypoint_missing
[ -d "$repo/users" ] || fail canonical_users_missing
[ -d "$repo/geelooy/.data" ] || fail canonical_data_missing
[ -f "$extension_builder" ] || fail extension_builder_missing
[ -f "$virtual_ssh_probe" ] || fail virtual_ssh_protocol_probe_missing
[ -f "$prewarm_script" ] || fail compact_prewarm_script_missing

node "$extension_builder"
[ -s "$extension_artifact" ] || fail extension_artifact_missing
[ -z "$(git -C "$repo" status --porcelain)" ] || fail extension_build_dirtied_repo
if [ -f "$override" ]; then
	cp "$override" "$backup"
	had_override=1
fi
armed=1
install -D -m 0644 "$source_override" "$override"
systemctl daemon-reload
systemctl restart "$service"

healthy=0
for _attempt in $(seq 1 60); do
	if systemctl is-active --quiet "$service" && curl -fsS "$health_url" >/dev/null; then
		healthy=1
		break
	fi
	sleep 1
done
[ "$healthy" -eq 1 ] || fail service_health_timeout

working_directory="$(systemctl show "$service" -p WorkingDirectory --value)"
exec_start="$(systemctl show "$service" -p ExecStart --value)"
service_environment="$(systemctl show "$service" -p Environment --value)"
[ "$working_directory" = "$repo" ] || fail service_working_directory_mismatch
case "$exec_start" in
	*"$repo/index.js"*) ;;
	*) fail service_exec_start_mismatch ;;
esac
require_environment "VIRTUAL_SSH_HOST=0.0.0.0"
require_environment "VIRTUAL_SSH_PUBLIC_HOST=awtsmoos.com"
require_environment "VIRTUAL_SSH_PORT=$virtual_ssh_port"
require_environment "VIRTUAL_SSH_MAX_CONNECTIONS=64"
require_environment "VIRTUAL_SSH_CONNECTIONS_PER_MINUTE=60"
require_environment "VIRTUAL_SSH_IDLE_MS=1800000"
require_environment "VIRTUAL_SSH_TOKEN_TTL_MS=900000"
bash "$virtual_ssh_probe" "$virtual_ssh_port" >/dev/null || fail virtual_ssh_protocol_probe_failed
bash "$prewarm_script" "$prewarm_base" >/dev/null || fail compact_prewarm_failed
[ "$(git -C "$repo" rev-parse HEAD)" = "$expected" ] || fail post_restart_head_mismatch
[ -z "$(git -C "$repo" status --porcelain)" ] || fail post_restart_repo_dirty

committed=1
rm -f "$backup"
trap - EXIT
printf 'B"H CANONICAL_SERVER_ACTIVE sha=%s repo=%s service=%s extension=%s virtualSsh=protocol-verified compact=prewarmed\n' "$expected" "$repo" "$service" "$extension_artifact"
