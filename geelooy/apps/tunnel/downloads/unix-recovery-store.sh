#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos guards an incumbent from an unproved promotion;
# Awtsmoos.com allows a truly empty first installation to enter motion.

# Validate the runtime being protected before permitting a rollback seed.
runtime_probe_compatible() {
	local runtime_root="$1"
	local node_bin="$(recovery_node_bin 2>/dev/null || true)"
	if [ -z "$node_bin" ]; then
		return 1
	fi
	if [ -f "$runtime_root/scripts/install-probe.cjs" ]; then
		"$node_bin" "$runtime_root/scripts/install-probe.cjs" "$runtime_root" >/dev/null 2>&1
		return $?
	fi
	"$node_bin" - "$runtime_root" <<'NODE' >/dev/null 2>&1
const path = require("node:path");
const root = process.argv[2];
require(path.join(root, "lib", "local-api.js"));
require(path.join(root, "lib", "runtime", "main-dependencies.js"));
NODE
}

# Place authenticated emergency binaries outside the replaceable runtime root.
install_rescue_runtime() {
	local recovery_bin="$RECOVERY_ROOT/bin"
	local canonical=""
	local compatibility=""
	local canonical_hash=""
	local compatibility_hash=""
	local pair=""
	mkdir -p "$recovery_bin"
	for pair in \
		"unix-recovery-rescue.sh:awtsmoos-recovery-rescue.sh" \
		"unix-recovery-validation.sh:awtsmoos-recovery-validation.sh" \
		"unix-recovery-identity.sh:awtsmoos-recovery-identity.sh" \
		"unix-recovery-candidates.sh:awtsmoos-recovery-candidates.sh" \
		"awtsmoos-tunnel-client.js:awtsmoos-legacy-tunnel-client.js" \
		"awtsmoos-tunnel-client.js:legacy-tunnel-client.js"; do
		local source_name="${pair%%:*}"
		local target_name="${pair##*:}"
		cp -p "$AWTSMOOS_INSTALL_RUNTIME/$source_name" "$recovery_bin/$target_name"
		chmod +x "$recovery_bin/$target_name"
	done
	canonical="$recovery_bin/awtsmoos-legacy-tunnel-client.js"
	compatibility="$recovery_bin/legacy-tunnel-client.js"
	canonical_hash="$(sha256_file "$canonical")"
	compatibility_hash="$(sha256_file "$compatibility")"
	if [ -z "$canonical_hash" ] || [ "$canonical_hash" != "$compatibility_hash" ]; then
		install_event "recovery" "failed" \
			"Mirrored fallback clients do not have identical verified bytes." \
			"canonical=$canonical_hash compatibility=$compatibility_hash"
		return 1
	fi
	install_event "recovery" "passed" \
		"Mirrored fallback clients were installed with identical verified bytes." \
		"sha256=$canonical_hash"
}

# Count sealed known-good versions, never treating an empty directory as proof.
recovery_version_count() {
	local versions_root="$RECOVERY_ROOT/versions"
	[ -d "$versions_root" ] || { printf '0\n'; return 0; }
	local count=0 entry=""
	for entry in "$versions_root"/*/; do
		[ -d "$entry" ] || continue
		count=$((count + 1))
	done
	printf '%s\n' "$count"
}

# A first install has no predecessor to displace. An existing incumbent still
# needs a real sealed rollback path: never manufacture an empty recovery record.
require_rollback_path() {
	local count
	count="$(recovery_version_count)"
	if [ "${count:-0}" -ge 1 ]; then
		return 0
	fi
	if [ -n "${ROOT:-}" ] && [ ! -f "$ROOT/main.js" ] && \
		[ ! -f "$ROOT/install-state.txt" ] && [ ! -d "$ROOT/lib" ]; then
		install_event "recovery" "not-required" \
			"First installation has no active runtime to displace." "root=$ROOT"
		return 0
	fi
	install_event "recovery" "failed" \
		"No recovery version exists; refusing to proceed without a rollback path." \
		"recovery=$RECOVERY_ROOT versions=0"
	printf '[Awtsmoos][recovery][failed] No recovery version exists at %s/versions; refusing to displace the live runtime without a rollback path.\n' \
		"$RECOVERY_ROOT" >&2
	return 1
}

# Load the independently verified archival implementation from the same package.
if [ -n "${AWTSMOOS_INSTALL_RUNTIME:-}" ] && \
	[ -f "$AWTSMOOS_INSTALL_RUNTIME/unix-recovery-store-archive.sh" ]; then
	source "$AWTSMOOS_INSTALL_RUNTIME/unix-recovery-store-archive.sh"
fi
