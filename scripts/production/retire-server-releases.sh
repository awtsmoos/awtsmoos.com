#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He
# The Awtsmoos removes obsolete server garments only after canonical service truth is alive;
# Awtsmoos.com writes the witness first, then retires direct children without following a symlinked path.
set -Eeuo pipefail

mode="dry-run"
[ "${1:-}" != "--apply" ] || mode="apply"
releases="${AWTSMOOS_PRODUCTION_RELEASES:-/mnt/HC_Volume_102267213/releases}"
repo="${AWTSMOOS_PRODUCTION_REPO:-/mnt/HC_Volume_102267213/git/awtsmoos.com}"
service="${AWTSMOOS_PRODUCTION_SERVICE:-awtsmoos.service}"
health_url="${AWTSMOOS_PRODUCTION_HEALTH_URL:-http://127.0.0.1:8080/}"
manifest_root="${AWTSMOOS_RETIRE_MANIFEST_ROOT:-/mnt/HC_Volume_102267213/deployments}"
test_mode="${AWTSMOOS_RETIRE_TEST_MODE:-0}"

fail() {
	echo "B\"H RELEASE_RETIRE_FAIL reason=$1" >&2
	exit 1
}

[ -d "$releases" ] || fail releases_root_missing
releases="$(cd "$releases" && pwd -P)"
[ -n "$releases" ] && [ "$releases" != "/" ] || fail unsafe_releases_root

if [ "$test_mode" = "1" ]; then
	case "$releases" in
		/tmp/*|/private/tmp/*) ;;
		*) fail unsafe_test_root ;;
	esac
elif [ "$releases" != "/mnt/HC_Volume_102267213/releases" ]; then
	fail unexpected_production_releases_root
fi

verify_service() {
	[ "$test_mode" = "1" ] && return 0
	[ -d "$repo/.git" ] || fail canonical_repo_missing
	[ "$(git -C "$repo" branch --show-current)" = "main" ] || fail canonical_repo_not_main
	[ -z "$(git -C "$repo" status --porcelain)" ] || fail canonical_repo_dirty
	systemctl is-active --quiet "$service" || fail service_not_active
	[ "$(systemctl show "$service" -p WorkingDirectory --value)" = "$repo" ] || fail service_not_canonical
	exec_start="$(systemctl show "$service" -p ExecStart --value)"
	case "$exec_start" in *"$repo/index.js"*) ;; *) fail service_exec_not_canonical ;; esac
	if systemctl cat "$service" | grep -q '/releases/current'; then
		fail systemd_still_references_releases
	fi
	curl -fsS "$health_url" >/dev/null || fail local_health_failed
}

candidate_name() {
	case "$1" in
		awtsmoos-[A-Za-z0-9._-]*|.stage-awtsmoos-[A-Za-z0-9._-]*) return 0 ;;
		*) return 1 ;;
	esac
}

mkdir -p "$manifest_root"
manifest="$manifest_root/server-release-retirement-$(date -u +%Y%m%dT%H%M%SZ)-$$.manifest"
: > "$manifest"
printf 'mode=%s\nreleases=%s\nrepo=%s\n' "$mode" "$releases" "$repo" >> "$manifest"

count=0
for path in "$releases"/* "$releases"/.stage-*; do
	[ -e "$path" ] || continue
	[ -d "$path" ] || continue
	[ ! -L "$path" ] || continue
	name="$(basename "$path")"
	candidate_name "$name" || continue
	printf 'candidate=%s\n' "$path" >> "$manifest"
	count=$((count + 1))
done

printf 'B"H RELEASE_RETIRE_PLAN mode=%s count=%s manifest=%s\n' "$mode" "$count" "$manifest"
[ "$mode" = "apply" ] || exit 0
verify_service

while IFS= read -r line; do
	case "$line" in
		candidate=*) path="${line#candidate=}" ;;
		*) continue ;;
	esac
	case "$path" in "$releases"/*) ;; *) fail candidate_escaped_root ;; esac
	[ -d "$path" ] && [ ! -L "$path" ] || fail candidate_changed
	candidate_name "$(basename "$path")" || fail candidate_name_changed
	rm -rf -- "$path"
done < "$manifest"

if [ -L "$releases/current" ]; then
	rm -- "$releases/current"
fi
printf 'B"H RELEASE_RETIRE_APPLIED count=%s manifest=%s\n' "$count" "$manifest"
