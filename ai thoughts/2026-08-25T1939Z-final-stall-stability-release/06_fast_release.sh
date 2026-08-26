#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

set -eEuo pipefail

ROOT="/Users/awtsmoos/work/awtsmoos.com"
RESULT="$ROOT/ai thoughts/2026-08-25T1939Z-final-stall-stability-release/07_release_result.txt"
INDEX="$(mktemp -t awtsmoos-tunnel-index.XXXXXX)"
CURRENT="bootstrap"
trap 'CODE=$?; printf "STATE=failed\nSTEP=%s\nCODE=%s\n" "$CURRENT" "$CODE" > "$RESULT"; rm -f "$INDEX"; exit "$CODE"' ERR
trap 'rm -f "$INDEX"' EXIT

cd "$ROOT"
rm -f "$INDEX"
CURRENT="fetch_origin_main"
git fetch origin main
LOCAL_HEAD="$(git rev-parse HEAD)"
BASE="$(git rev-parse origin/main)"
printf 'STATE=regenerating\nLOCAL_HEAD=%s\nBASE=%s\n' "$LOCAL_HEAD" "$BASE" > "$RESULT"
CURRENT="regenerate_artifacts"
node scripts/tunnel/regenerate-artifacts.cjs >/tmp/awtsmoos-regenerate.json
VERSION="$(grep -m1 -Eo '[0-9]+\.[0-9]+\.[0-9]+' geelooy/apps/tunnel/agent/manifest.txt)"
[[ -n "$VERSION" ]]

RELEASE_PATHS=(
	geelooy/apps/tunnel/agent
	geelooy/apps/tunnel/downloads
	geelooy/apps/tunnel/test
	geelooy/apps/tunnel/README.md
	geelooy/apps/tunnel/DOCUMENTATION.md
	geelooy/apps/tunnel/EMERGENCY_RECOVERY.md
	geelooy/api/tunnel/control/routes/fsVessel
	geelooy/api/tunnel/control/core/actionGuidance.js
	geelooy/api/tunnel/control/core/actionGuidanceProtocol.js
	geelooy/api/tunnel/control/core/instructionGuidance.js
	geelooy/api/tunnel/install
	ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay
	ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/structure/map/index.js
	ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/core/processLock/lockFiles.js
	ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/core/processLock/lockPolicy.js
	scripts/tunnel
)

CURRENT="temporary_index"
GIT_INDEX_FILE="$INDEX" git read-tree "$BASE"
GIT_INDEX_FILE="$INDEX" git add -A -- "${RELEASE_PATHS[@]}"
STAGED="$(GIT_INDEX_FILE="$INDEX" git diff --cached --name-only --diff-filter=ACMR)"
[[ -n "$STAGED" ]]
printf 'STATE=syntax\nVERSION=%s\nBASE=%s\n' "$VERSION" "$BASE" > "$RESULT"

while IFS= read -r FILE; do
	[[ -f "$FILE" ]] || continue
	case "$FILE" in
		*.js|*.cjs|*.mjs)
			CURRENT="syntax:$FILE"
			node --check "$FILE" >/dev/null
			;;
	esac
done <<< "$STAGED"

CURRENT="write_tree"
TREE="$(GIT_INDEX_FILE="$INDEX" git write-tree)"
COMMIT="$(printf 'B"H\n\nTunnel release closure %s: ship exact runtime manifest dependencies\n' "$VERSION" | git commit-tree "$TREE" -p "$BASE")"
TAG="tunnel-agent-v$VERSION"
printf 'STATE=pushing\nVERSION=%s\nBASE=%s\nCOMMIT=%s\nTAG=%s\n' "$VERSION" "$BASE" "$COMMIT" "$TAG" > "$RESULT"

CURRENT="push_main"
git push origin "$COMMIT:refs/heads/main"
CURRENT="push_tag"
git push origin "$COMMIT:refs/tags/$TAG"
printf 'STATE=published\nVERSION=%s\nBASE=%s\nCOMMIT=%s\nTAG=%s\n' "$VERSION" "$BASE" "$COMMIT" "$TAG" > "$RESULT"
printf 'BHY_RELEASE_PUBLISHED %s %s\n' "$VERSION" "$COMMIT"
