#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos lets an older verified predecessor testify through the installer when
# its runtime predates project-root receipts. Awtsmoos.com binds the compatibility
# proof to the exact registered PID, configured root, access policy, and fresh time.

ensure_rollback_project_root_receipt() {
	local pid="$1"
	project_root_ready "$pid" 600000 && return 0
	synthesize_project_root_receipt "$pid"
	project_root_ready "$pid" 600000
}

synthesize_project_root_receipt() {
	local pid="$1"
	local config="$ROOT/config.json"
	local receipt="$(project_root_receipt_path)"
	runtime_pid_matches "$pid" || return 1
	runtime_registered "$pid" 600000 || return 1
	node - "$config" "$receipt" "$pid" <<'NODE'
const fs = require("node:fs");
const path = require("node:path");
const [configFile, receiptFile, pidValue] = process.argv.slice(2);
try {
	const config = JSON.parse(fs.readFileSync(configFile, "utf8"));
	const root = path.resolve(String(config.root || process.cwd()));
	fs.accessSync(root, fs.constants.R_OK);
	const writable = (() => {
		try { fs.accessSync(root, fs.constants.W_OK); return true; }
		catch { return false; }
	})();
	if (config.allowWrite === true && !writable) process.exit(2);
	const temporary = `${receiptFile}.tmp-${process.pid}`;
	fs.writeFileSync(temporary, `${JSON.stringify({
		schemaVersion: 1,
		state: "ready",
		ok: true,
		pid: Number(pidValue),
		root,
		allowWrite: config.allowWrite === true,
		readable: true,
		writable,
		source: "installer_rollback_compatibility",
		updatedAt: new Date().toISOString()
	}, null, 2)}\n`, { mode: 0o600 });
	fs.renameSync(temporary, receiptFile);
} catch (error) {
	console.error(error.message);
	process.exit(1);
}
NODE
}
