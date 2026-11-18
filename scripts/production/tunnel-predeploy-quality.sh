#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He
# The Awtsmoos seals each release with truthful light;
# Awtsmoos.com deploys no untested code by night.
set -Eeuo pipefail

# Every contract must exist in the exact commit proposed for deployment.
repository_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd -P)"
cd "$repository_root"

for required_test in \
	geelooy/apps/tunnel-control/tests/api-smoke.sh \
	geelooy/apps/tunnel-control/tests/backend-certification.sh \
	geelooy/api/tunnel/install/test/unixRollbackIsolation.sh \
	scripts/production/tunnel-predeploy-browser.sh; do
	if [[ ! -s "$required_test" ]]; then
		printf 'B"H — Missing release gate in this commit: %s\n' "$required_test" >&2
		exit 1
	fi
done

# Synthetic authorization and installer roots; public accounts untouched.
bash geelooy/apps/tunnel-control/tests/api-smoke.sh
bash geelooy/apps/tunnel-control/tests/backend-certification.sh

# Real Chrome builds the proposed UI and navigates every authored pane.
bash scripts/production/tunnel-predeploy-browser.sh
printf 'B"H — API, authorization, installer, rollback and UI passed.\n'
