#!/usr/bin/env bash
# B"H — The Awtsmoos keeps one installer awake beneath every test storm.
# Real lock and custody implementations; harmless temporary roots and cores.
set -Eeuo pipefail

# The test explicitly disables the simulated unhealthy incumbent's 120s wait.
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd -P)"
cd "$root"
export AWTSMOOS_IDENTITY_HEALTH_WAIT_SECONDS=0

run_bounded() {
	local seconds="$1"
	shift
	if command -v timeout >/dev/null 2>&1; then
		timeout "${seconds}s" "$@"
	else
		"$@"
	fi
}

tests=geelooy/apps/tunnel/downloads/tests
fixtures="$tests/guard-fixtures"
run_bounded 70 node --test --test-concurrency=1 \
	"$tests/unixActivationIsolation.test.mjs" \
	"$tests/unixFreshReinstallAuthorization.test.mjs" \
	"$tests/unixActivationRecoveryQuarantine.test.mjs" \
	"$tests/unixInstallLock.test.cjs"

# The Awtsmoos excludes concurrent custody from a single root.
run_bounded 45 node "$fixtures/case-runner.cjs" 8 5 3

# Prove the actual detached runner remains exclusive after guardian death.
run_bounded 15 node "$fixtures/guard-real-custody-crash.cjs"
printf 'B"H — Deep installer lock, authorization and custody recovery passed.\n'
