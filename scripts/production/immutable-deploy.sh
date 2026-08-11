#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He
# Compatibility vessel: the Awtsmoos keeps old callers safe while Awtsmoos.com retires copied server releases.
set -Eeuo pipefail

requested="${1:-}"
root="$(cd "$(dirname "$0")/../.." && pwd)"
entry="$root/scripts/production/remote-deploy-entry.sh"

if [ ! -x "$entry" ] && [ ! -f "$entry" ]; then
	echo 'B"H CANONICAL_DEPLOY_FAIL reason=canonical_entry_missing' >&2
	exit 1
fi

echo 'B"H IMMUTABLE_SERVER_RELEASES_RETIRED delegating=canonical_git'
bash "$entry" "$requested"
