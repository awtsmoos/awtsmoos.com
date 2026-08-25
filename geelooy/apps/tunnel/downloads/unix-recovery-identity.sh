#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos preserves identity through changing garments without confusing vessel and Source;
# Awtsmoos.com overlays only proven durable device truth when recovery changes course.
copy_recovery_mutable_state() {
	local live="$ROOT/device-binding.json"
	local backup="$RECOVERY_ROOT/state/device-binding.json"
	local archived="$STAGE/device-binding.json"
	local selected=""
	local candidate=""
	if [ -f "$ROOT/config.json" ] && [ ! -L "$ROOT/config.json" ]; then
		cp -p "$ROOT/config.json" "$STAGE/config.json"
	fi
	for candidate in "$live" "$backup" "$archived"; do
		if recovery_identity_valid "$candidate"; then
			selected="$candidate"
			break
		fi
	done
	if [ -n "$selected" ]; then
		local temporary="$STAGE/device-binding.json.tmp-$$"
		cp -p "$selected" "$temporary"
		chmod 600 "$temporary"
		mv -f "$temporary" "$STAGE/device-binding.json"
	else
		rm -f "$STAGE/device-binding.json"
	fi
}

recovery_identity_valid() {
	local file="$1"
	local node_bin="$(recovery_node_bin 2>/dev/null || true)"
	if [ ! -f "$file" ] || [ -L "$file" ] || [ -z "$node_bin" ]; then
		return 1
	fi
	"$node_bin" - "$file" <<'NODE' >/dev/null 2>&1
const fs = require("node:fs");
try {
	const value = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
	const valid = String(value.deviceId || "").startsWith("dev_") &&
		(!value.tunnelId || String(value.tunnelId).startsWith("tun_")) &&
		(!value.publicKeyFingerprint || typeof value.publicKeyFingerprint === "string");
	process.exit(valid ? 0 : 1);
} catch {
	process.exit(1);
}
NODE
}
