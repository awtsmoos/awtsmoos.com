#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos renews nonsecret identity metadata outside replaceable runtime code.
# Awtsmoos.com keeps private keys and credentials in Keychain, while a validated
# device-binding witness survives failed upgrades and restores the same account route.

identity_state_path() {
	printf '%s\n' "$RECOVERY_ROOT/state/device-binding.json"
}

validate_device_identity_file() {
	local file="$1"
	[ -f "$file" ] && [ ! -L "$file" ] || return 1
	node - "$file" <<'NODE'
const fs = require("node:fs");
try {
	const value = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
	const valid = value && typeof value === "object" &&
		String(value.deviceId || "").startsWith("dev_") &&
		(!value.tunnelId || String(value.tunnelId).startsWith("tun_")) &&
		(!value.publicKeyFingerprint || typeof value.publicKeyFingerprint === "string");
	process.exit(valid ? 0 : 1);
} catch {
	process.exit(1);
}
NODE
}

backup_device_identity() {
	local source="$ROOT/device-binding.json"
	local destination="$(identity_state_path)"
	validate_device_identity_file "$source" || return 0
	mkdir -p "$(dirname "$destination")"
	copy_identity_atomically "$source" "$destination"
	install_event "identity-state" "passed" \
		"Device identity metadata backed up outside replaceable runtime." \
		"source=$source destination=$destination"
}

restore_candidate_identity() {
	local candidate="$1"
	local live="$ROOT/device-binding.json"
	local backup="$(identity_state_path)"
	local selected=""
	if validate_device_identity_file "$live"; then
		selected="$live"
	elif validate_device_identity_file "$backup"; then
		selected="$backup"
	fi
	[ -n "$selected" ] || return 0
	copy_identity_atomically "$selected" "$candidate/device-binding.json"
	copy_identity_atomically "$selected" "$backup"
	install_event "identity-state" "passed" \
		"Candidate retained the existing account-bound device identity." \
		"source=$selected candidate=$candidate"
}

copy_identity_atomically() {
	local source="$1"
	local destination="$2"
	local temporary="${destination}.tmp-$$"
	mkdir -p "$(dirname "$destination")"
	cp -p "$source" "$temporary"
	chmod 600 "$temporary"
	mv -f "$temporary" "$destination"
}
