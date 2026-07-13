#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

runtime_probe_compatible() {
	local runtime_root="$1"

	if [ -f "$runtime_root/scripts/install-probe.cjs" ]; then
		node "$runtime_root/scripts/install-probe.cjs" "$runtime_root" >/dev/null 2>&1
		return $?
	fi

	node - "$runtime_root" <<'NODE' >/dev/null 2>&1
const path = require("node:path");
const root = process.argv[2];
require(path.join(root, "lib", "local-api.js"));
require(path.join(root, "lib", "runtime", "main-dependencies.js"));
NODE
}

install_rescue_runtime() {
	local recovery_bin="$RECOVERY_ROOT/bin"
	mkdir -p "$recovery_bin"

	for pair in \
		"unix-recovery-rescue.sh:awtsmoos-recovery-rescue.sh" \
		"unix-recovery-validation.sh:awtsmoos-recovery-validation.sh" \
		"unix-recovery-candidates.sh:awtsmoos-recovery-candidates.sh"; do
		local source_name="${pair%%:*}"
		local target_name="${pair##*:}"
		cp -p "$AWTSMOOS_INSTALL_RUNTIME/$source_name" "$recovery_bin/$target_name"
		chmod +x "$recovery_bin/$target_name"
	done
}

archive_known_good_runtime() {
	local reason="${1:-known_good_before_activation}"
	local version
	local stamp
	local identifier
	local versions_root="$RECOVERY_ROOT/versions"
	local temporary
	local destination
	local file_list

	[ -f "$ROOT/main.js" ] || return 0
	if ! runtime_probe_compatible "$ROOT"; then
		install_event "archive" "skipped" \
			"Current runtime did not pass the compatibility probe." "$ROOT"
		return 1
	fi

	version="$(cat "$ROOT/install-state.txt" 2>/dev/null || printf '%s' unknown)"
	stamp="$(date -u +%Y%m%dT%H%M%SZ)"
	identifier="${stamp}-${version//[^0-9A-Za-z._-]/_}"
	temporary="$versions_root/.${identifier}.tmp-$$"
	destination="$versions_root/$identifier"
	file_list="$temporary/files.txt"
	mkdir -p "$temporary"

	write_archive_file_list "$file_list" || {
		rm -rf "$temporary"
		return 1
	}

	if ! tar -cf "$temporary/runtime.tar" -C "$ROOT" -T "$file_list"; then
		rm -rf "$temporary"
		install_event "archive" "failed" "Could not create the known-good archive." "$ROOT"
		return 1
	fi

	write_archive_metadata "$temporary" "$version" "$reason"
	rm -f "$file_list"
	mv "$temporary" "$destination"
	prune_recovery_versions
	install_event "archive" "passed" "Preserved a known-good runtime." \
		"version=$version directory=$destination"
}
