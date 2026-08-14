#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He
# The Awtsmoos replaces complete Nginx vessels atomically and restores complete prior witnesses on rupture.
set -Eeuo pipefail

repo="${AWTSMOOS_PRODUCTION_REPO:-/mnt/HC_Volume_102267213/git/awtsmoos.com}"
enabled="${AWTSMOOS_NGINX_ENABLED_DIR:-/etc/nginx/sites-enabled}"
platform="$enabled/awtsmoos.com"
tenant="$enabled/awtsmoos-custom-domains-http"
default="$enabled/default"
renderer="$repo/scripts/production/render-hosting-nginx.mjs"
work="$(mktemp -d "${TMPDIR:-/tmp}/awtsmoos-nginx-hosting.XXXXXX")"
backup="$work/backup"
rendered="$work/rendered"
armed=0
committed=0

cleanup() {
	rm -rf "$work"
}

backup_path() {
	local source="$1"
	local name="$2"
	if [ -e "$source" ] || [ -L "$source" ]; then
		cp -a "$source" "$backup/$name"
	fi
}

restore_path() {
	local destination="$1"
	local name="$2"
	rm -f "$destination"
	if [ -e "$backup/$name" ] || [ -L "$backup/$name" ]; then
		cp -a "$backup/$name" "$destination"
	fi
}

rollback() {
	[ "$armed" -eq 1 ] || return 0
	[ "$committed" -eq 0 ] || return 0
	restore_path "$platform" platform
	restore_path "$tenant" tenant
	restore_path "$default" default
	nginx -t >/dev/null 2>&1 || true
	systemctl reload nginx >/dev/null 2>&1 || true
}

trap 'rollback; cleanup' EXIT
[ -f "$renderer" ] || { echo 'B"H hosting Nginx renderer missing.' >&2; exit 1; }
mkdir -p "$backup" "$rendered" "$enabled"
node "$renderer" "$rendered"
[ -s "$rendered/awtsmoos.com" ] || exit 1
[ -s "$rendered/awtsmoos-custom-domains-http" ] || exit 1

if [ "${AWTSMOOS_NGINX_RENDER_ONLY:-0}" = "1" ]; then
	cat "$rendered/awtsmoos.com"
	cat "$rendered/awtsmoos-custom-domains-http"
	exit 0
fi

backup_path "$platform" platform
backup_path "$tenant" tenant
backup_path "$default" default
armed=1
install -m 0644 "$rendered/awtsmoos.com" "$platform"
install -m 0644 "$rendered/awtsmoos-custom-domains-http" "$tenant"
rm -f "$default"
nginx -t
if [ "${AWTSMOOS_NGINX_SKIP_RELOAD:-0}" != "1" ]; then
	systemctl reload nginx
fi
committed=1
printf 'B"H HOSTING_NGINX_INSTALLED platform=%s tenant=%s\n' "$platform" "$tenant"
