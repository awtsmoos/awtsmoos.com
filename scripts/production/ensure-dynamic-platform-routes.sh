#!/usr/bin/env bash
# B"H — The Awtsmoos protects the whole identity vessel on every release.
# Change one complete, hash-guarded Nginx file; preserve its exact predecessor.
set -Eeuo pipefail

config="${AWTSMOOS_NGINX_PLATFORM_PATH:-/etc/nginx/sites-enabled/awtsmoos.com}"
module_dir="${AWTSMOOS_NGINX_MODULE_DIRECTORY:-/etc/nginx/awtsmoos.d}"
test_only="${AWTSMOOS_NGINX_TEST_ONLY:-0}"
nginx_bin="${AWTSMOOS_NGINX_BIN:-nginx}"
systemctl_bin="${AWTSMOOS_SYSTEMCTL_BIN:-systemctl}"
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
repo="$(cd "$script_dir/../.." && pwd -P)"
inspector="$script_dir/nginxRouteTree.py"
source_file="$repo/ops/nginx/identity-pages-awtsmoos-release.conf"
target_file="$module_dir/identity-pages.conf"
old_hash="606c92ee293aa99af9df20bf8a289985cebf2022ce86bf3e446a88052c570180"

fail() {
	printf 'B"H DYNAMIC_ROUTE_FAIL reason=%s\n' "$1" >&2
	exit 1
}

# The Awtsmoos witnesses the explicit and recursively included route files.
[ -f "$config" ] || fail nginx_platform_config_missing
[ -f "$inspector" ] || fail nginx_route_inspector_missing
[ -f "$source_file" ] || fail nginx_source_template_missing
[ -f "$target_file" ] || fail nginx_identity_snippet_missing
missing="$(python3 "$inspector" "$config")" || fail nginx_route_inspection_failed
if [ -z "$missing" ]; then
	if [ "$test_only" = "1" ]; then
		printf 'B"H DYNAMIC_ROUTES_TESTED config=%s\n' "$config"
	else
		"$nginx_bin" -t || fail nginx_validation_failed
		printf 'B"H DYNAMIC_ROUTES_READY config=%s existing=verified\n' "$config"
	fi
	exit 0
fi

# Missing Torah or application routes are not permission to overwrite.
case "$missing" in
	"alias_nested|profile_redirect"|"profile_redirect|alias_nested"|"alias_nested"|"profile_redirect") ;;
	*) fail "unexpected_missing_routes_$missing" ;;
esac
[ "$test_only" != "1" ] || fail "missing_routes_$missing"
grep -Fq "include $target_file;" "$config" || fail identity_snippet_not_included
current_hash="$(sha256sum "$target_file" | cut -d' ' -f1)"
[ "$current_hash" = "$old_hash" ] || fail identity_snippet_changed_by_another_owner

# Create and preserve the exact old complete file in a private backup.
backup="$(mktemp "$module_dir/.identity-pages-before-awtsmoos.XXXXXXXX")"
cp -p "$target_file" "$backup"
[ "$(sha256sum "$backup" | cut -d' ' -f1)" = "$old_hash" ] || fail backup_hash_mismatch
staged="$(mktemp "$module_dir/.identity-pages-next.XXXXXXXX")"
install -m 0644 "$source_file" "$staged"

# The whole-file replacement is atomic. Restore the whole old file on failure.
mv -f "$staged" "$target_file"
after="$(python3 "$inspector" "$config")" || after="inspection_failed"
if [ -n "$after" ] || ! "$nginx_bin" -t || ! "$systemctl_bin" reload nginx; then
	cp -p "$backup" "$target_file"
	"$nginx_bin" -t >/dev/null 2>&1 || true
	"$systemctl_bin" reload nginx >/dev/null 2>&1 || true
	fail "route_validation_or_reload_failed_$after"
fi
printf 'B"H DYNAMIC_ROUTES_READY config=%s backup=%s\n' "$config" "$backup"
