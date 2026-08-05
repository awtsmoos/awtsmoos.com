#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# Cleanup is defined only after every helper it may invoke has been sourced.
cleanup_install() {
	local exit_code=$?
	trap - EXIT INT TERM
	stop_candidate_probe 2>/dev/null || true
	if [ "$exit_code" -ne 0 ]; then
		fail_install_progress \
			"Awtsmoos Tunnel installation failed before verified readiness."
		if [ -n "${CANDIDATE_ROOT:-}" ]; then
			remove_disposable_candidate "$CANDIDATE_ROOT"
			remove_disposable_candidate "${CANDIDATE_ROOT}.downloads"
		fi
	fi
	release_install_lock
	exit "$exit_code"
}

activation_phase() {
	node - "$RECOVERY_ROOT/transactions/install-current.json" <<'NODE'
const fs = require("node:fs");
try {
	const value = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
	process.stdout.write(String(value.phase || "unknown"));
} catch {
	process.stdout.write("unknown");
}
NODE
}
