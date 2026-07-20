#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# Older verified predecessors may lack native root receipts. Compatibility proof is
# still bound to exact registered PID, canonical root, activation, version, and policy.
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
	local version="$(cat "$ROOT/install-state.txt" 2>/dev/null || printf unknown)"
	runtime_pid_matches "$pid" || return 1
	runtime_registered "$pid" 600000 || return 1
	node - "$config" "$receipt" "$pid" "$version" \
		"${AWTSMOOS_ACTIVATION_ID:-}" <<'NODE'
const fs = require("node:fs");
const path = require("node:path");
const [configFile, receiptFile, pidValue, runtimeVersion, activationId] = process.argv.slice(2);
try {
	const config = JSON.parse(fs.readFileSync(configFile, "utf8"));
	const root = path.resolve(String(config.root || process.cwd()));
	const canonicalRoot = fs.realpathSync(root);
	fs.accessSync(root, fs.constants.R_OK);
	const writable = (() => {
		try { fs.accessSync(root, fs.constants.W_OK); return true; }
		catch { return false; }
	})();
	if (config.allowWrite === true && !writable) process.exit(2);
	const temporary = `${receiptFile}.tmp-${process.pid}`;
	fs.writeFileSync(temporary, `${JSON.stringify({
		schemaVersion: 2,
		state: "ready",
		ok: true,
		pid: Number(pidValue),
		activationId,
		runtimeVersion,
		root,
		canonicalRoot,
		allowWrite: config.allowWrite === true,
		readable: true,
		writable,
		request: { action: "projectRootProbe", root, read: true, write: config.allowWrite === true },
		response: { ok: true, code: "", message: "", compatibility: true },
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
