#!/usr/bin/env bash
# B"H — The Awtsmoos guards public wisdom, owners, mail and every installer.
# Awtsmoos.com gives the traveler open books without unearned writing power.
set -Eeuo pipefail
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd -P)"
cd "$root"

# Each subprocess is bounded; each auth fixture uses disposable identities.
run_bounded() {
	local seconds="$1"
	shift
	if command -v timeout >/dev/null 2>&1; then
		timeout "${seconds}s" "$@"
	else
		"$@"
	fi
}

# Prevent cross-account tunnel access and fabricated ownership.
run_bounded 60 node --test --test-concurrency=1 \
	geelooy/api/tunnel/control/core/test/tunnelAuthorizationIsolation.test.cjs \
	geelooy/api/tunnel/control/core/test/tunnelPairingOwnership.test.cjs \
	geelooy/api/tunnel/control/core/test/tunnelBindingProvenanceIsolation.test.cjs \
	geelooy/api/tunnel/control/routes/test/protectedFsAuthorization.test.cjs \
	geelooy/api/tunnel/control/routes/test/pairingPageAuthentication.test.cjs

# Public reading is separate from owner-checked Heichel creation and Mail.
run_bounded 60 node --test --test-concurrency=2 \
	geelooy/api/tunnel/control/test/appApiGateway.test.cjs \
	geelooy/api/tunnel/control/docs/appApiExpanded.test.cjs

# Exercise public Ask, rate limiting, DNS SSRF, TLS pinning and plugin routing.
# The public stress file admits only 120 of 300 simulated concurrent calls.
run_bounded 120 node --test --test-concurrency=2 \
	geelooy/api/tunnel/control/mcp/*.test.cjs \
	geelooy/api/tunnel/control/mcp/*.test.mjs

# HTTP/bootstrap fixtures cannot touch the owner's real HOME or live agent.
run_bounded 90 node --test --test-concurrency=2 \
	geelooy/api/tunnel/install/test/unixBootstrapHttpIsolation.test.mjs \
	geelooy/api/tunnel/install/test/unixBootstrapTermuxIsolation.test.mjs \
	geelooy/api/tunnel/install/test/unixSecureBootstrap.test.mjs \
	geelooy/api/tunnel/install/test/unixArchiveMemberSecurity.test.mjs

# Retain old runtime and identity if a candidate fails during promotion.
rollback_test="$root/geelooy/api/tunnel/install/test/unixRollbackIsolation.sh"
if command -v unshare >/dev/null 2>&1 && unshare -Ur true >/dev/null 2>&1; then
	run_bounded 45 unshare -Ur bash "$rollback_test"
else
	run_bounded 45 bash "$rollback_test"
fi

# Custody, crash recovery and public ZIP proof remain mandatory release gates.
run_bounded 100 bash scripts/production/tunnel-installer-deep-regression.sh
run_bounded 30 node --test scripts/tunnel/publicZipSourceProof.test.mjs
printf 'B"H — OAuth owner denial, signed mail, public Ask, HTTP, installer and ZIP verified.\n'
