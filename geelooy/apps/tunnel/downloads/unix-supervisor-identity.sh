#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# Registration failure enters one bounded identity doctor before another launch.
# The Awtsmoos repairs only proven key wounds and leaves coherent credentials whole.
repair_identity_after_registration_failure() {
	local reason="${1:-registration_failure}"
	local output_file="$RECOVERY_ROOT/logs/identity-repair-last.json"
	mkdir -p "$(dirname "$output_file")"
	if node "$ROOT/scripts/recovery-control.cjs" repair-identity \
		"$ROOT" "$reason" > "$output_file" 2>> "$RECOVERY_LOG"; then
		local state="$(identity_repair_result "$output_file" state)"
		local changed="$(identity_repair_result "$output_file" changed)"
		supervisor_log "identity_repair_completed" \
			"reason=$reason state=$state changed=$changed"
		return 0
	fi
	supervisor_log "identity_repair_failed" "reason=$reason"
	return 1
}

identity_repair_result() {
	local file="$1"
	local field="$2"
	node - "$file" "$field" <<'NODE'
const fs = require("node:fs");
const [file, field] = process.argv.slice(2);
try {
	const value = JSON.parse(fs.readFileSync(file, "utf8"));
	process.stdout.write(String(value?.repair?.[field] ?? "missing"));
} catch {
	process.stdout.write("missing");
}
NODE
}
