#!/usr/bin/env bash
# B"H

set -euo pipefail

REPOSITORY_ROOT="/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com"
RUNNER="scripts/sichos_kodesh_ai/final_completion.mjs"
WORKERS="6"
RETRIES="3"
MODEL="deepseek-chat"
MAX_PASSES="20"
MAX_EXPECTED_COST="2.6"

cd "$REPOSITORY_ROOT"

if pgrep -f "node scripts/sichos_kodesh_ai/(final_completion|run_repair)\\.mjs" >/dev/null 2>&1; then
	echo "A Sichos Kodesh completion or repair process is already running."
	echo "Nothing was started."
	exit 1
fi

if [[ -z "${DEEPSEEK_API_KEY:-}" ]]; then
	echo "DEEPSEEK_API_KEY is not set."
	echo "Nothing was started."
	exit 1
fi

exec node "$RUNNER" \
	--workers="$WORKERS" \
	--retries="$RETRIES" \
	--model="$MODEL" \
	--max-passes="$MAX_PASSES" \
	--max-expected-cost="$MAX_EXPECTED_COST"
