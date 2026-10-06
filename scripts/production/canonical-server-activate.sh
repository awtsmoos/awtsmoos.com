#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He
# The Awtsmoos keeps the kernel-owned HTTP doorway alive while Awtsmoos.com replaces the Node vessel behind it without losing the gate.
set -Eeuo pipefail

expected="${1:-}"
repo="${AWTSMOOS_PRODUCTION_REPO:-/mnt/HC_Volume_102267213/git/awtsmoos.com}"
service="${AWTSMOOS_PRODUCTION_SERVICE:-awtsmoos.service}"
socket_unit="${AWTSMOOS_PRODUCTION_SOCKET:-awtsmoos.socket}"
override="${AWTSMOOS_SYSTEMD_OVERRIDE_PATH:-/etc/systemd/system/${service}.d/10-immutable-release.conf}"
source_override="$repo/ops/systemd/awtsmoos-immutable.conf"
source_socket="$repo/ops/systemd/awtsmoos.socket"
health_url="${AWTSMOOS_PRODUCTION_HEALTH_URL:-http://127.0.0.1:8080/}"
extension_builder="$repo/geelooy/ai/scripts/buildServerExtensionZip.cjs"
extension_artifact="$repo/geelooy/ai/relay/install/awtsmoos-server-extension.zip"
script_directory="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
tunnel_preflight="$script_directory/tunnel-bundle-preflight.cjs"
watchdog_installer="$script_directory/install-health-watchdog.sh"
virtual_ssh_probe="$script_directory/virtual-ssh-listener-probe.sh"
compact_prewarmer="$script_directory/compact-prewarm.mjs"
nginx_preparer="$script_directory/canonical-nginx-mime.sh"
service_verifier="$script_directory/canonical-service-verify.sh"
virtual_ssh_port="${AWTSMOOS_VIRTUAL_SSH_PORT:-2223}"
backup="${TMPDIR:-/tmp}/awtsmoos-service-override.$$.bak"
armed=0
committed=0
had_override=0
socket_preexisting=0

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
	if [ "$socket_preexisting" -eq 0 ]; then
		systemctl stop "$socket_unit" || true
		systemctl disable "$socket_unit" || true
		rm -f "/etc/systemd/system/$socket_unit" || true
	fi
	systemctl daemon-reload || true
	systemctl restart "$service" || true
}

trap rollback EXIT
[[ "$expected" =~ ^[0-9a-f]{40}$ ]] || fail invalid_expected_sha
[[ "$virtual_ssh_port" =~ ^[0-9]+$ ]] || fail invalid_virtual_ssh_port
[ "$virtual_ssh_port" -ge 1 ] && [ "$virtual_ssh_port" -le 65535 ] || fail invalid_virtual_ssh_port
[ -d "$repo/.git" ] || fail canonical_repo_missing
[ "$(git -C "$repo" branch --show-current)" = "main" ] || fail canonical_repo_not_main
[ -z "$(git -C "$repo" status --porcelain)" ] || fail canonical_repo_dirty
[ "$(git -C "$repo" rev-parse HEAD)" = "$expected" ] || fail canonical_head_mismatch
[ "$(git -C "$repo" rev-parse origin/main)" = "$expected" ] || fail canonical_origin_mismatch
for required in "$source_override" "$source_socket" "$extension_builder" "$tunnel_preflight" "$watchdog_installer" "$virtual_ssh_probe" "$compact_prewarmer" "$nginx_preparer" "$service_verifier"; do
	[ -f "$required" ] || fail "required_file_missing_$(basename "$required")"
done
[ -f "$repo/index.js" ] || fail canonical_entrypoint_missing
[ -d "$repo/users" ] || fail canonical_users_missing
[ -d "$repo/geelooy/.data" ] || fail canonical_data_missing

node "$tunnel_preflight" "$repo" >/dev/null || fail tunnel_bundle_preflight_failed
node "$extension_builder"
[ -s "$extension_artifact" ] || fail extension_artifact_missing
[ -z "$(git -C "$repo" status --porcelain)" ] || fail extension_build_dirtied_repo
if [ -f "$override" ]; then cp "$override" "$backup"; had_override=1; fi
if systemctl is-enabled --quiet "$socket_unit" 2>/dev/null; then socket_preexisting=1; fi
armed=1
install -D -m 0644 "$source_override" "$override"
printf '\nEnvironment=AWTSMOOS_RELEASE_SHA=%s\n' "$expected" >> "$override"
install -D -m 0644 "$source_socket" "/etc/systemd/system/$socket_unit"
bash "$watchdog_installer"
bash "$nginx_preparer"

systemctl daemon-reload
if [ "$socket_preexisting" -eq 0 ]; then
	systemctl stop "$service" || true
	systemctl enable --now "$socket_unit"
	systemctl start "$service"
else
	systemctl restart "$service"
fi

healthy=0
for _attempt in $(seq 1 60); do
	if systemctl is-active --quiet "$socket_unit" && systemctl is-active --quiet "$service" && curl -fsS "$health_url" >/dev/null 2>&1; then
		healthy=1
		break
	fi
	sleep 1
done
[ "$healthy" -eq 1 ] || fail service_health_timeout
bash "$service_verifier" "$service" "$repo" "$expected" "$virtual_ssh_port" "$virtual_ssh_probe"

if [ "${AWTSMOOS_COMPACT_PREWARM:-0}" = "1" ]; then
	AWTSMOOS_PRODUCTION_HEALTH_URL="$health_url" AWTSMOOS_COMPACT_PREWARM_TIMEOUT_MS="${AWTSMOOS_COMPACT_PREWARM_TIMEOUT_MS:-90000}" node "$compact_prewarmer" || fail compact_prewarm_failed
else
	echo 'B"H compact prewarm deferred; production service is live'
fi
[ -z "$(git -C "$repo" status --porcelain)" ] || fail post_prewarm_repo_dirty
committed=1
rm -f "$backup"
trap - EXIT
compact_status=deferred
[ "${AWTSMOOS_COMPACT_PREWARM:-0}" = "1" ] && compact_status=prewarmed
printf 'B"H CANONICAL_SERVER_ACTIVE sha=%s repo=%s service=%s socket=%s extension=%s virtualSsh=protocol-verified compact=%s tunnelBundle=preflight-passed\n' "$expected" "$repo" "$service" "$socket_unit" "$extension_artifact" "$compact_status"
