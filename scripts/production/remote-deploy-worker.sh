#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He
# The Awtsmoos lets one leased worker advance the Git vessel; Awtsmoos.com reaches newest main without restart rain.
set -Eeuo pipefail

requested="${1:-}"
repo="${AWTSMOOS_PRODUCTION_REPO:-/mnt/HC_Volume_102267213/git/awtsmoos.com}"
route_guard="$repo/scripts/production/ensure-dynamic-platform-routes.sh"

fail() {
	echo "B\"H CANONICAL_DEPLOY_FAIL reason=$1" >&2
	exit 1
}

[ -d "$repo/.git" ] || fail canonical_repo_missing
[ -f "$route_guard" ] || fail dynamic_route_guard_missing
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
if [ "$head_sha" = "$remote_sha" ]; then
	printf 'B"H CANONICAL_DEPLOY_NOOP sha=%s repo=%s\n' "$remote_sha" "$repo"
	exit 0
fi

git -C "$repo" merge-base --is-ancestor "$head_sha" "$remote_sha" || fail canonical_non_fast_forward
node "$repo/scripts/production/frontendReleaseGuard.cjs" "$repo" "$head_sha" "$remote_sha"
git -C "$repo" merge --ff-only "$remote_sha"
[ "$(git -C "$repo" rev-parse HEAD)" = "$remote_sha" ] || fail canonical_fast_forward_mismatch
[ -z "$(git -C "$repo" status --porcelain)" ] || fail canonical_repo_dirty_after_update

if [ -f "$repo/scripts/tunnel/syncPluginInstructionMirror.cjs" ] && [ -d "$repo/plugins/awtsmoos-shliach" ]; then
	node "$repo/scripts/tunnel/syncPluginInstructionMirror.cjs"
fi

bash "$route_guard"
bash "$repo/scripts/production/canonical-server-activate.sh" "$remote_sha"
printf 'B"H CANONICAL_DEPLOY_OK sha=%s repo=%s\n' "$remote_sha" "$repo"
