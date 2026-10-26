#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He
# The Awtsmoos advances one proven Git vessel, restores its declared garments, and proves Awtsmoos.com alive without confusing checkout with revelation.
set -Eeuo pipefail

requested="${1:-}"
repo="${AWTSMOOS_PRODUCTION_REPO:-/mnt/HC_Volume_102267213/git/awtsmoos.com}"
service="${AWTSMOOS_PRODUCTION_SERVICE:-awtsmoos.service}"
route_guard="$repo/scripts/production/ensure-dynamic-platform-routes.sh"
release_match="$repo/scripts/production/service-release-match.sh"
mode_normalizer="$repo/scripts/production/normalize-tracked-modes.cjs"

fail() {
	echo "B\"H CANONICAL_DEPLOY_FAIL reason=$1" >&2
	exit 1
}

normalize_modes() {
	[ -f "$mode_normalizer" ] || fail tracked_mode_normalizer_missing
	node "$mode_normalizer" "$repo" || fail tracked_mode_normalization_failed
	[ -z "$(git -C "$repo" status --porcelain)" ] || fail canonical_repo_dirty_after_mode_normalize
}

[ -d "$repo/.git" ] || fail canonical_repo_missing
[ -f "$route_guard" ] || fail dynamic_route_guard_missing
[ -f "$release_match" ] || fail service_release_match_missing
[ "$(git -C "$repo" branch --show-current)" = "main" ] || fail canonical_repo_not_main
[ -z "$(git -C "$repo" status --porcelain)" ] || fail canonical_repo_dirty

git -C "$repo" fetch origin main
remote_sha="$(git -C "$repo" rev-parse origin/main)"
[[ "$remote_sha" =~ ^[0-9a-f]{40}$ ]] || fail invalid_remote_sha
if [ -n "$requested" ] && [ "$requested" != "$remote_sha" ]; then
	git -C "$repo" cat-file -e "$requested^{commit}" 2>/dev/null || fail requested_sha_unknown
	git -C "$repo" merge-base --is-ancestor "$requested" "$remote_sha" || fail requested_sha_not_ancestor_of_origin_main
	printf 'B"H CANONICAL_DEPLOY_SUPERSEDED requested=%s sha=%s\n' "$requested" "$remote_sha"
fi

head_sha="$(git -C "$repo" rev-parse HEAD)"
static_policy="$repo/scripts/production/static-deploy-safety.cjs"
static_marker="${AWTSMOOS_STATIC_DEPLOY_MARKER:-/var/lib/awtsmoos-production-deploy/static-release.json}"
static_only=0
if [ "$head_sha" != "$remote_sha" ] && [ -f "$static_policy" ] && node "$static_policy" eligible "$repo" "$head_sha" "$remote_sha"; then
	static_only=1
fi

if [ "$head_sha" = "$remote_sha" ]; then
	normalize_modes
	if bash "$release_match" "$remote_sha" "$service"; then
		bundle_cache="${AWTSMOOS_TUNNEL_BUNDLE_CACHE_DIR:-/var/cache/awtsmoos-tunnel-bundle}"
		if ! AWTSMOOS_RELEASE_SOURCE_SHA="$remote_sha" AWTSMOOS_TUNNEL_BUNDLE_CACHE_DIR="$bundle_cache" node -e '
			const path = require("node:path");
			const root = process.argv[1];
			const bundle = require(path.join(root, "geelooy/api/tunnel/install/tools/zipBundle.js"));
			process.exit(bundle.readVerifiedCache() ? 0 : 1);
		' "$repo"; then
			AWTSMOOS_RELEASE_SOURCE_SHA="$remote_sha" AWTSMOOS_TUNNEL_BUNDLE_CACHE_DIR="$bundle_cache" node "$repo/scripts/production/tunnel-bundle-preflight.cjs" "$repo" >/dev/null || fail tunnel_bundle_preflight_failed
		fi
		printf 'B"H CANONICAL_DEPLOY_NOOP sha=%s repo=%s tunnelBundle=verified modes=normalized\n' "$remote_sha" "$repo"
		exit 0
	fi
	printf 'B"H CANONICAL_DEPLOY_REACTIVATE sha=%s reason=service_release_mismatch\n' "$remote_sha"
else
	git -C "$repo" merge-base --is-ancestor "$head_sha" "$remote_sha" || fail canonical_non_fast_forward
	git -C "$repo" merge --ff-only "$remote_sha"
	[ "$(git -C "$repo" rev-parse HEAD)" = "$remote_sha" ] || fail canonical_fast_forward_mismatch
	normalize_modes
fi

if [ "$static_only" -eq 1 ]; then
	systemctl is-active --quiet "$service" || fail static_service_unhealthy
	pid="$(systemctl show "$service" -p MainPID --value)"
	[[ "$pid" =~ ^[0-9]+$ ]] && [ "$pid" -gt 1 ] || fail static_service_pid_missing
	curl -fsS --max-time 4 "${AWTSMOOS_PRODUCTION_HEALTH_URL:-http://127.0.0.1:8080/}" >/dev/null || fail static_service_http_unhealthy
	[ -z "$(git -C "$repo" status --porcelain)" ] || fail static_repo_dirty
	node "$static_policy" mark "$static_marker" "$remote_sha" "$pid" || fail static_marker_failed
	printf 'B"H CANONICAL_DEPLOY_OK sha=%s repo=%s mode=static_no_restart pid=%s modes=normalized\n' "$remote_sha" "$repo" "$pid"
	exit 0
fi

if [ -f "$repo/scripts/tunnel/syncPluginInstructionMirror.cjs" ] && [ -d "$repo/plugins/awtsmoos-shliach" ]; then
	node "$repo/scripts/tunnel/syncPluginInstructionMirror.cjs"
fi

bash "$route_guard"
bash "$repo/scripts/production/canonical-server-activate.sh" "$remote_sha"
printf 'B"H CANONICAL_DEPLOY_OK sha=%s repo=%s modes=normalized\n' "$remote_sha" "$repo"
