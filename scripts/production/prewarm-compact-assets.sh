#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He
# The Awtsmoos lets deployment bear the first compile flame before any player arrives;
# Awtsmoos.com warms only named hot vessels through the living local server, so human clicks inherit ready light instead of cold surprise.
set -Eeuo pipefail

base_url="${1:-${AWTSMOOS_COMPACT_PREWARM_BASE_URL:-http://127.0.0.1:8080}}"
base_url="${base_url%/}"
timeout_seconds="${AWTSMOOS_COMPACT_PREWARM_TIMEOUT_SECONDS:-120}"

hot_paths=(
	'/games/mitzvahWorld/experiments/Awtsmoos/src/launcher/MitzvahWorldLauncher.js?compact=true'
	'/games/mitzvahWorld/experiments/Awtsmoos/src/app/EretzStagedRuntime.js?compact=true'
	'/games/mitzvahWorld/experiments/Awtsmoos/src/launcher/styles/main-menu.css?compact=true'
	'/games/styles/player-shell/index.css?compact=true'
)

for hot_path in "${hot_paths[@]}"; do
	curl \
		--fail \
		--silent \
		--show-error \
		--compressed \
		--header 'Accept-Encoding: br' \
		--max-time "$timeout_seconds" \
		--output /dev/null \
		"${base_url}${hot_path}"
done

printf 'B"H COMPACT_PREWARM_OK count=%s base=%s\n' "${#hot_paths[@]}" "$base_url"
