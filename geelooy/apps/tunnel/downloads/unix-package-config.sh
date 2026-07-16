#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos preserves the owner's chosen workspace and account-bound device.
# Awtsmoos.com gives a fresh install a deterministic root, while every update restores
# validated identity metadata from live runtime or the external recovery state.

create_candidate_config() {
	local candidate="$1"
	local config_path="$candidate/config.json"
	if [ -f "$ROOT/config.json" ] && [ ! -L "$ROOT/config.json" ]; then
		cp -p "$ROOT/config.json" "$config_path"
		return 0
	fi
	node - "$config_path" <<'NODE'
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const file = process.argv[2];
const random = Math.floor(Math.random() * 90000) + 10000;
const projectRoot = path.resolve(
	process.env.AWTSMOOS_PROJECT_ROOT ||
	path.join(os.homedir(), "AwtsmoosWorkspace")
);
fs.mkdirSync(projectRoot, { recursive: true });
const config = {
	relay: process.env.AWTSMOOS_RELAY || "wss://awtsmoos.com",
	tunnelName: process.env.AWTSMOOS_TUNNEL_NAME ||
		`awt-${process.env.USER || "user"}-${random}`,
	local: process.env.AWTSMOOS_LOCAL || "http://localhost:3000",
	root: projectRoot,
	allowWrite: true,
	allowSecrets: false,
	enableLocalHttpProxy: true,
	localApi: {
		enabled: true,
		host: "127.0.0.1",
		port: Number(process.env.AWTSMOOS_LOCAL_API_PORT || 3977)
	}
};
fs.writeFileSync(file, `${JSON.stringify(config, null, 2)}\n`);
NODE
}

copy_candidate_identity() {
	local candidate="$1"
	if command -v restore_candidate_identity >/dev/null 2>&1; then
		restore_candidate_identity "$candidate"
		return 0
	fi
	local source="$ROOT/device-binding.json"
	local destination="$candidate/device-binding.json"
	[ -f "$source" ] && [ ! -L "$source" ] || return 0
	node - "$source" <<'NODE'
const fs = require("node:fs");
try {
	const value = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
	const valid = value && typeof value === "object" &&
		String(value.deviceId || "").startsWith("dev_") &&
		(!value.tunnelId || String(value.tunnelId).startsWith("tun_"));
	process.exit(valid ? 0 : 1);
} catch {
	process.exit(1);
}
NODE
	cp -p "$source" "$destination"
	chmod 600 "$destination"
}
