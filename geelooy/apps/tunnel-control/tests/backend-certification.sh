#!/usr/bin/env bash
# B"H — Awtsmoos.com tests the owner's boundary and the guardian's return.
# The Awtsmoos grants proof to the real source, in disposable test vessels.
set -Eeuo pipefail
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd -P)"
cd "$root"

run_bounded() {
	local seconds="$1"
	shift
	if command -v timeout >/dev/null 2>&1; then
		timeout "${seconds}s" "$@"
	else
		"$@"
	fi
}

# Real owner, foreign-account and pairing policy modules use synthetic fixtures.
run_bounded 60 node --test --test-concurrency=1 \
	geelooy/api/tunnel/control/core/test/tunnelAuthorizationIsolation.test.cjs \
	geelooy/api/tunnel/control/core/test/tunnelPairingOwnership.test.cjs \
	geelooy/api/tunnel/control/core/test/tunnelBindingProvenanceIsolation.test.cjs \
	geelooy/api/tunnel/control/routes/test/protectedFsAuthorization.test.cjs \
	geelooy/api/tunnel/control/routes/test/pairingPageAuthentication.test.cjs

# Sealed archives are served by a local fixture and do not pair real machines.
run_bounded 90 node --test --test-concurrency=2 \
	geelooy/api/tunnel/install/test/unixBootstrapHttpIsolation.test.mjs \
	geelooy/api/tunnel/install/test/unixBootstrapTermuxIsolation.test.mjs \
	geelooy/api/tunnel/install/test/unixSecureBootstrap.test.mjs \
	geelooy/api/tunnel/install/test/unixArchiveMemberSecurity.test.mjs

# Real rollback and binding-restore functions act only on disposable /tmp roots.
rollback_test="$root/geelooy/api/tunnel/install/test/unixRollbackIsolation.sh"
if command -v unshare >/dev/null 2>&1 && unshare -Ur true >/dev/null 2>&1; then
	run_bounded 45 unshare -Ur bash "$rollback_test"
else
	run_bounded 45 bash "$rollback_test"
fi
printf 'B"H — Authorization, bootstrap, rollback and identity tests passed.\n'
