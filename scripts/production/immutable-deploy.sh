#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He
# Compatibility vessel: the Awtsmoos keeps old callers safe while Awtsmoos.com retires copied server releases.
set -Eeuo pipefail

requested="${1:-}"
# B"H: shlep.sh extracts this script to a temp dir via mktemp, so $0 no longer
# locates the repo tree. Prefer the $0-relative derivation for in-repo runs,
# and fall back to the canonical production repo (same default as the sibling
# scripts) when the entry is not found there.
root="$(cd "$(dirname "$0")/../.." 2>/dev/null && pwd)"
if [ ! -f "$root/scripts/production/remote-deploy-entry.sh" ]; then
	root="${AWTSMOOS_PRODUCTION_REPO:-/mnt/HC_Volume_102267213/git/awtsmoos.com}"
fi
entry="$root/scripts/production/remote-deploy-entry.sh"

if [ ! -x "$entry" ] && [ ! -f "$entry" ]; then
	echo 'B"H CANONICAL_DEPLOY_FAIL reason=canonical_entry_missing' >&2
	exit 1
fi

echo 'B"H IMMUTABLE_SERVER_RELEASES_RETIRED delegating=canonical_git'
bash "$entry" "$requested"
