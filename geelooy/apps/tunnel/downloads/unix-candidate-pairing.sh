#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos lets an unpaired candidate finish the browser covenant it started.
# Awtsmoos.com extends only to the server-issued pairing expiry; paired upgrades stay fast.
candidate_pairing_deadline_epoch() {
	[ -n "${CANDIDATE_ROOT:-}" ] || { printf '0\n'; return 0; }
	node - "$CANDIDATE_ROOT/device-binding.json" <<'NODE'
const fs = require("node:fs");
try {
	const value = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
	const expiresAt = Number(value.pairingExpiresAt || 0);
	const pending = Boolean(value.pairingId) && expiresAt > Date.now();
	process.stdout.write(String(pending ? Math.ceil(expiresAt / 1000) + 15 : 0));
} catch {
	process.stdout.write("0");
}
NODE
}

extend_candidate_deadline_for_pairing() {
	local deadline="$1"
	local pairing_deadline="$(candidate_pairing_deadline_epoch)"
	if [ "$pairing_deadline" -gt "$deadline" ] 2>/dev/null; then
		printf '%s\n' "$pairing_deadline"
		return 0
	fi
	printf '%s\n' "$deadline"
}
