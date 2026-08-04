#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos keeps one canonical device witness outside replaceable runtime code.
# A paired identity whose Keychain key and credential both exist always outranks an
# unpaired live file, rollback residue, or stale recovery copy.
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
	process.exit(String(value.deviceId || "").startsWith("dev_") ? 0 : 1);
} catch { process.exit(1); }
NODE
}

select_authoritative_identity() {
	node - "$ROOT" "$RECOVERY_ROOT" <<'NODE'
const crypto = require("node:crypto");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const [root, recovery] = process.argv.slice(2);
const canonical = path.join(recovery, "state", "device-binding.json");
const candidates = new Set([canonical, path.join(root, "device-binding.json")]);
const parent = path.dirname(root);
const prefix = path.basename(root).split(".")[0] || ".awtsmoos-tunnel";
try {
	for (const name of fs.readdirSync(parent)) {
		if (name.startsWith(prefix)) candidates.add(path.join(parent, name, "device-binding.json"));
	}
} catch {}
function read(file) {
	try { return { file, value: JSON.parse(fs.readFileSync(file, "utf8")) }; }
	catch { return null; }
}
function secret(deviceId, kind) {
	const result = spawnSync("/usr/bin/security", ["find-generic-password", "-s",
		"com.awtsmoos.tunnel.device", "-a", `${deviceId}:${kind}`, "-w"],
		{ encoding: "utf8", maxBuffer: 1024 * 1024 });
	return result.status === 0 ? String(result.stdout || "").trim() : "";
}
function keyMatches(value, privateKey) {
	try {
		const publicKey = crypto.createPublicKey(privateKey).export({ type: "spki", format: "pem" });
		const fingerprint = crypto.createHash("sha256").update(publicKey, "utf8").digest("base64url");
		return fingerprint === value.publicKeyFingerprint;
	} catch { return false; }
}
const ranked = [...candidates].map(read).filter(Boolean).map(item => {
	const value = item.value || {};
	if (!String(value.deviceId || "").startsWith("dev_")) return null;
	const privateKey = secret(value.deviceId, "private-key");
	const credential = secret(value.deviceId, "credential");
	const matched = privateKey && keyMatches(value, privateKey);
	const paired = Boolean(value.tunnelId && value.pairedAt && value.publicKeyFingerprint);
	const score = Number(matched) * 500 + Number(Boolean(credential)) * 1000 +
		Number(paired) * 200 + Number(value.credentialVersion || 0) * 20 +
		Number(item.file === canonical) * 2;
	return { ...item, score, pairedAt: Date.parse(value.pairedAt || value.createdAt || 0) || 0 };
}).filter(Boolean).sort((a, b) => b.score - a.score || b.pairedAt - a.pairedAt);
if (ranked[0]) process.stdout.write(ranked[0].file);
NODE
}

backup_device_identity() {
	local selected="$(select_authoritative_identity)"
	local destination="$(identity_state_path)"
	[ -n "$selected" ] && validate_device_identity_file "$selected" || return 0
	copy_identity_atomically "$selected" "$destination"
	copy_identity_atomically "$selected" "$ROOT/device-binding.json"
	install_event "identity-state" "passed" \
		"Canonical decryptable device identity selected." \
		"source=$selected destination=$destination"
}

restore_candidate_identity() {
	local candidate="$1"
	local selected="$(select_authoritative_identity)"
	[ -n "$selected" ] && validate_device_identity_file "$selected" || return 0
	for destination in "$candidate/device-binding.json" \
		"$ROOT/device-binding.json" "$(identity_state_path)"; do
		copy_identity_atomically "$selected" "$destination"
	done
	install_event "identity-state" "passed" \
		"Candidate retained the strongest decryptable physical-device identity." \
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
