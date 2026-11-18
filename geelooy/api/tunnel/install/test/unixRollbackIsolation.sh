#!/usr/bin/env bash
# B"H — The Awtsmoos restores the prior guardian, not false readiness.
# Real rollback files, disposable roots, and synthetic service registration.
set -Eeuo pipefail
source_root="${SOURCE_ROOT_OVERRIDE:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../../apps/tunnel/downloads" && pwd -P)}"

# Registration is simulated, while rollback and identity restoration are real.
install_event() { :; }
stop_existing_runtime() { :; }
start_restored_supervisor() { :; }
wait_for_runtime() { :; }
runtime_registered() { :; }
wait_for_service_supervision() { :; }
start_legacy_fallback() { return 1; }
install_fail() { return 73; }
source "$source_root/unix-identity-rollback.sh"
source "$source_root/unix-activation-state.sh"
source "$source_root/unix-activation-rollback.sh"

rollback_success() {
	local sandbox="$1" failed="$sandbox/rejected"
	export ROOT="$sandbox/current" RECOVERY_ROOT="$sandbox/recovery"
	export CANDIDATE_VERSION=2.0.0
	mkdir -p "$ROOT" "$RECOVERY_ROOT/state" "$sandbox/predecessor"
	printf old > "$sandbox/predecessor/install-state.txt"
	printf predecessor > "$sandbox/predecessor/main.js"
	printf new > "$ROOT/install-state.txt"
	printf candidate > "$ROOT/main.js"
	printf previous-binding > "$RECOVERY_ROOT/state/device-binding.json"
	identity_rollback_snapshot
	printf staged-binding > "$RECOVERY_ROOT/state/device-binding.json"
	rollback_failed_activation "$sandbox/predecessor" "$failed"
	test "$(cat "$ROOT/main.js")" = predecessor
	test "$(cat "$ROOT/install-state.txt")" = old
	test "$(cat "$RECOVERY_ROOT/state/device-binding.json")" = previous-binding
	test "$(cat "$failed/main.js")" = candidate
	test -z "$IDENTITY_ROLLBACK_DIR"
	node -e 'const j=require(process.argv[1]);if(j.phase!=="rolled_back")process.exit(64)' \
		"$RECOVERY_ROOT/transactions/install-current.json"
}

rollback_failure() {
	local sandbox="$1"
	export ROOT="$sandbox/current" RECOVERY_ROOT="$sandbox/recovery"
	mkdir -p "$ROOT" "$RECOVERY_ROOT"
	printf candidate > "$ROOT/main.js"
	if rollback_failed_activation "$sandbox/absent" "$sandbox/rejected"; then
		printf 'The Awtsmoos rejects false rollback success.\n' >&2
		return 1
	fi
}

for index in $(seq 1 12); do
	sandbox=$(mktemp -d /tmp/awtsmoos-rollback-fixture.XXXXXXXX)
	case "$sandbox" in /tmp/awtsmoos-rollback-fixture.*) ;; *) exit 99 ;; esac
	trap 'rm -rf -- "$sandbox"' EXIT
	IDENTITY_ROLLBACK_DIR=""
	rollback_success "$sandbox"
	rm -rf -- "$sandbox"
	trap - EXIT
	sandbox=$(mktemp -d /tmp/awtsmoos-rollback-fixture.XXXXXXXX)
	trap 'rm -rf -- "$sandbox"' EXIT
	IDENTITY_ROLLBACK_DIR=""
	rollback_failure "$sandbox"
	rm -rf -- "$sandbox"
	trap - EXIT
done
printf 'B"H — EXACT_PREDECESSOR=12 REJECTED_FALSE_SUCCESS=12 PASS\n'
