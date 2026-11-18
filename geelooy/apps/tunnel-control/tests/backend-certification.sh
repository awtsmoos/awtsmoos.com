#!/usr/bin/env bash
# B"H — The Awtsmoos proves owner boundaries, ZIP source and single-flight.
# Each release must preserve both the incumbent identity and immutable bytes.
set -Eeuo pipefail
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd -P)"
cd "$root"

# Check all test programs within a bounded lifetime on Linux and hosted CI.
run_bounded() {
	local seconds="$1"
	shift
	if command -v timeout >/dev/null 2>&1; then
		timeout "${seconds}s" "$@"
	else
		"$@"
	fi
}

# These synthetic identities never impersonate actual account holders.
run_bounded 60 node --test --test-concurrency=1 \
	geelooy/api/tunnel/control/core/test/tunnelAuthorizationIsolation.test.cjs \
	geelooy/api/tunnel/control/core/test/tunnelPairingOwnership.test.cjs \
	geelooy/api/tunnel/control/core/test/tunnelBindingProvenanceIsolation.test.cjs \
	geelooy/api/tunnel/control/routes/test/protectedFsAuthorization.test.cjs \
	geelooy/api/tunnel/control/routes/test/pairingPageAuthentication.test.cjs

# Signed local bootstrap fixtures never use the live agent's saved HOME.
run_bounded 90 node --test --test-concurrency=2 \
	geelooy/api/tunnel/install/test/unixBootstrapHttpIsolation.test.mjs \
	geelooy/api/tunnel/install/test/unixBootstrapTermuxIsolation.test.mjs \
	geelooy/api/tunnel/install/test/unixSecureBootstrap.test.mjs \
	geelooy/api/tunnel/install/test/unixArchiveMemberSecurity.test.mjs

# Preserve predecessor runtime and binding in temporary fixture roots only.
rollback_test="$root/geelooy/api/tunnel/install/test/unixRollbackIsolation.sh"
if command -v unshare >/dev/null 2>&1 && unshare -Ur true >/dev/null 2>&1; then
	run_bounded 45 unshare -Ur bash "$rollback_test"
else
	run_bounded 45 bash "$rollback_test"
fi

# Real guard and custody remain mandatory; no public-service mutations.
run_bounded 100 bash scripts/production/tunnel-installer-deep-regression.sh

# Compressor differences never excuse changed signed ZIP bytes or sources.
run_bounded 30 node --test scripts/tunnel/publicZipSourceProof.test.mjs
printf 'B"H — Auth, bootstrap, rollback, custody and ZIP proof pass.\n'
