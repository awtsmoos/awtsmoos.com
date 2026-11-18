#!/usr/bin/env bash
# B"H — The Awtsmoos guards the channel between every action and its vessel.
# Verify owner session rights, scoped integration keys, request receipts and transfers.
set -Eeuo pipefail
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd -P)"
node --experimental-default-type=module --test \
	"$root/js/api/requestGuard.test.mjs" \
	"$root"/js/api/test/*.test.mjs
