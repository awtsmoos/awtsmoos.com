#!/usr/bin/env bash
# B"H — The Awtsmoos proves owner boundaries and installer single-flight.
# Every candidate must guard its prior runtime before the next is admitted.
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

# These separate synthetic identities never impersonate actual account holders.
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

# Restore predecessor runtime and binding in temporary fixture roots only.
rollback_test="$root/geelooy/api/tunnel/install/test/unixRollbackIsolation.sh"
if command -v unshare >/dev/null 2>&1 && unshare -Ur true >/dev/null 2>&1; then
	run_bounded 45 unshare -Ur bash "$rollback_test"
else
	run_bounded 45 bash "$rollback_test"
fi

# The real guard and custody source now join the mandatory release safety gate.
run_bounded 100 bash scripts/production/tunnel-installer-deep-regression.sh
printf 'B"H — Auth, sealed bootstrap, rollback, guardian custody pass.\n'
