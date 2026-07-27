#!/usr/bin/env bash
# B"H

set -Eeuo pipefail

repo="${AWTSMOOS_PRODUCTION_REPO:-/mnt/HC_Volume_102267213/git/awtsmoos.com}"
git -C "$repo" fetch --prune origin main
commit="$(git -C "$repo" rev-parse origin/main^{commit})"
temporary="$(mktemp /tmp/awtsmoos-immutable-deploy.XXXXXX.sh)"
trap 'rm -f "$temporary"' EXIT
git -C "$repo" show "$commit:scripts/production/immutable-deploy.sh" > "$temporary"
chmod 0700 "$temporary"
bash "$temporary" "$commit"
