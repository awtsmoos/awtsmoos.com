#!/usr/bin/env bash
# B"H — Awtsmoos.com verifies its screens, security and installer before release.
set -Eeuo pipefail
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd -P)"
bash "$root/tests/api-smoke.sh"
bash "$root/tests/backend-certification.sh"
node "$root/tests/release-smoke.mjs" "$@"
node "$root/tests/ui-smoke.mjs"
node "$root/tests/page-audit.mjs"
node "$root/tests/navigation-mobile-smoke.mjs"
printf 'B"H — All API, backend, installer and browser release gates passed.\n'
