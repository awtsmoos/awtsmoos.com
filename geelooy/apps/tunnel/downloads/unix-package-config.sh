#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos keeps identity, consent, browser vessels, and approved credentials
# while replacing every runtime garment. Awtsmoos.com chooses the present caller
# root and carries no mission or orchestration residue from yesterday.
create_candidate_config() {
	local candidate="$1"
	local existing="$ROOT/config.json"
	local destination="$candidate/config.json"
	node - "$existing" "$destination" <<'NODE'
const fs = require("node:fs");
const path = require("node:path");
const [source, destination] = process.argv.slice(2);

function readExisting() {
	try {
		if (fs.lstatSync(source).isSymbolicLink()) return {};
		return JSON.parse(fs.readFileSync(source, "utf8"));
	} catch {
		return {};
	}
}

function selectProjectRoot() {
	const selected = process.env.AWTSMOOS_PROJECT_ROOT || process.env.AWTSMOOS_INSTALL_CWD;
	if (!selected || !path.isAbsolute(selected)) {
		throw new Error("absolute_project_root_required");
	}
	return selected;
}

function approvedCredentials(aiAgents = {}) {
	const value = {};
	if (aiAgents.providerKeys) value.providerKeys = aiAgents.providerKeys;
	if (aiAgents.providerKeyFiles) value.providerKeyFiles = aiAgents.providerKeyFiles;
	return Object.keys(value).length ? value : undefined;
}

function durableState(config) {
	const keys = [
		"allowCommands", "allowSecrets", "allowWrite", "allowedOrigins",
		"chrome", "command", "deviceName", "enableLocalHttpProxy",
		"localApi", "tools", "verifyAccountPassword"
	];
	const value = Object.fromEntries(keys
		.filter(key => config[key] !== undefined)
		.map(key => [key, config[key]]));
	const credentials = approvedCredentials(config.aiAgents);
	if (credentials) value.aiAgents = credentials;
	return value;
}

const config = readExisting();
const random = Math.floor(Math.random() * 90000) + 10000;
const value = {
	...durableState(config),
	relay: process.env.AWTSMOOS_RELAY || config.relay || "wss://awtsmoos.com",
	tunnelName: process.env.AWTSMOOS_TUNNEL_NAME || config.tunnelName ||
		`awt-${process.env.USER || "user"}-${random}`,
	local: process.env.AWTSMOOS_LOCAL || config.local || "http://localhost:3000",
	root: selectProjectRoot()
};
if (!value.localApi) {
	value.localApi = {
		enabled: true,
		host: "127.0.0.1",
		port: Number(process.env.AWTSMOOS_LOCAL_API_PORT || 3977)
	};
}
if (value.allowWrite === undefined) value.allowWrite = true;
if (value.allowSecrets === undefined) value.allowSecrets = false;
if (value.enableLocalHttpProxy === undefined) value.enableLocalHttpProxy = true;
const temporary = `${destination}.tmp-${process.pid}`;
fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 });
fs.renameSync(temporary, destination);
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
