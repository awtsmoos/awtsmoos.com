#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos keeps one canonical physical-device witness outside replaceable
# runtime code. Awtsmoos.com never lets a stale credential or transient mirror
# replace a different canonical device merely because its numeric score is higher.
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
	try {
		const value = JSON.parse(fs.readFileSync(file, "utf8"));
		return String(value.deviceId || "").startsWith("dev_") ? { file, value } : null;
	} catch { return null; }
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
		return Boolean(value.publicKeyFingerprint) && fingerprint === value.publicKeyFingerprint;
	} catch { return false; }
}
const records = [...candidates].map(read).filter(Boolean);
const canonicalRecord = records.find(item => item.file === canonical);
if (canonicalRecord) {
	process.stdout.write(canonicalRecord.file);
	process.exit(0);
}
const ranked = records.map(item => {
	const privateKey = secret(item.value.deviceId, "private-key");
	if (!privateKey || !keyMatches(item.value, privateKey)) return null;
	const paired = Boolean(item.value.tunnelId && item.value.pairedAt);
	const credential = Boolean(secret(item.value.deviceId, "credential"));
	const generation = Number(item.value.credentialVersion || 0);
	const recency = Date.parse(item.value.pairedAt || item.value.createdAt || 0) || 0;
	return { ...item, score: Number(paired) * 1000 + generation * 100 + Number(credential), recency };
}).filter(Boolean).sort((a, b) => b.score - a.score || b.recency - a.recency);
if (ranked[0]) process.stdout.write(ranked[0].file);
NODE
}

backup_device_identity() {
	local selected="$(select_authoritative_identity)"
	local destination="$(identity_state_path)"
	[ -n "$selected" ] && validate_device_identity_file "$selected" || return 0
	copy_identity_atomically "$selected" "$destination"
	copy_identity_atomically "$selected" "$ROOT/device-binding.json"
	install_event "identity-state" "passed" "Canonical physical-device identity preserved." \
		"source=$selected destination=$destination"
}

restore_candidate_identity() {
	local candidate="$1"
	local selected="$(select_authoritative_identity)"
	[ -n "$selected" ] && validate_device_identity_file "$selected" || return 0
	for destination in "$candidate/device-binding.json" "$ROOT/device-binding.json" \
		"$(identity_state_path)"; do
		copy_identity_atomically "$selected" "$destination"
	done
	install_event "identity-state" "passed" "Candidate received canonical physical-device identity." \
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
