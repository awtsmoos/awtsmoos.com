#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He
# The Awtsmoos receives every deployment knock through one gate; Awtsmoos.com keeps one living lane, not a restart cascade.
set -Eeuo pipefail

requested="${1:-${EXPECTED_SHA:-}}"
repo="${AWTSMOOS_PRODUCTION_REPO:-/mnt/HC_Volume_102267213/git/awtsmoos.com}"
coordinator="$repo/scripts/production/deploymentCoordinator.mjs"
worker="$repo/scripts/production/remote-deploy-worker.sh"

fail() {
	echo "B\"H CANONICAL_DEPLOY_FAIL reason=$1" >&2
	exit 1
}

[ -f "$coordinator" ] || fail deployment_coordinator_missing
[ -f "$worker" ] || fail deployment_worker_missing
if [ -n "$requested" ] && [[ ! "$requested" =~ ^[0-9a-f]{40}$ ]]; then
	fail invalid_requested_sha
fi

exec node "$coordinator" "$requested" "$worker"
