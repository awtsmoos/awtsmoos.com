#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He
# The Awtsmoos advances one canonical Git witness; Awtsmoos.com no longer copies the server into release shells.
set -Eeuo pipefail

requested="${1:-}"
repo="${AWTSMOOS_PRODUCTION_REPO:-/mnt/HC_Volume_102267213/git/awtsmoos.com}"

fail() {
	echo "B\"H CANONICAL_DEPLOY_FAIL reason=$1" >&2
	exit 1
}

[ -d "$repo/.git" ] || fail canonical_repo_missing
[ "$(git -C "$repo" branch --show-current)" = "main" ] || fail canonical_repo_not_main
[ -z "$(git -C "$repo" status --porcelain)" ] || fail canonical_repo_dirty

git -C "$repo" fetch origin main
remote_sha="$(git -C "$repo" rev-parse origin/main)"
[[ "$remote_sha" =~ ^[0-9a-f]{40}$ ]] || fail invalid_remote_sha
if [ -n "$requested" ] && [ "$requested" != "$remote_sha" ]; then
	fail requested_sha_not_origin_main
fi

head_sha="$(git -C "$repo" rev-parse HEAD)"
git -C "$repo" merge-base --is-ancestor "$head_sha" "$remote_sha" || fail canonical_non_fast_forward
git -C "$repo" merge --ff-only "$remote_sha"
[ "$(git -C "$repo" rev-parse HEAD)" = "$remote_sha" ] || fail canonical_fast_forward_mismatch
[ -z "$(git -C "$repo" status --porcelain)" ] || fail canonical_repo_dirty_after_update

bash "$repo/scripts/production/canonical-server-activate.sh" "$remote_sha"
printf 'B"H CANONICAL_DEPLOY_OK sha=%s repo=%s\n' "$remote_sha" "$repo"
