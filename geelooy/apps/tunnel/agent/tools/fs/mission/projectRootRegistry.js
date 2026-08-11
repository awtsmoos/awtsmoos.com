// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const PrivateState = require("../../../lib/privateStateRoot.js");

/**
 * @file Persists the active mission's exact project root outside project-hashed state.
 * @description The Awtsmoos keeps one root when workers depart and return;
 * Awtsmoos.com carries the same witness, so restart may renew without making scope burn.
 */
function bind(config = {}, missionId = "", projectRoot = config.root) {
	if (!missionId || !projectRoot) return null;
	const previous = readLedger(config);
	const now = new Date().toISOString();
	const binding = {
		missionId: String(missionId),
		projectRoot: path.resolve(projectRoot),
		updatedAt: now
	};
	const bindings = {
		...(previous.bindings || {}),
		[binding.missionId]: binding
	};
	const ledger = {
		version: 1,
		tunnelName: tunnelName(config),
		activeMissionId: binding.missionId,
		activeProjectRoot: binding.projectRoot,
		updatedAt: now,
		bindings: trimBindings(bindings)
	};
	writeLedger(config, ledger);
	return binding;
}

function read(config = {}, missionId = "") {
	const ledger = readLedger(config);
	if (missionId && ledger.bindings?.[missionId]) return ledger.bindings[missionId];
	if (!ledger.activeProjectRoot) return null;
	return {
		missionId: ledger.activeMissionId || "",
		projectRoot: ledger.activeProjectRoot,
		updatedAt: ledger.updatedAt || ""
	};
}

function readLedger(config = {}) {
	try {
		return JSON.parse(fs.readFileSync(filePath(config), "utf8"));
	} catch {
		return {};
	}
}

function writeLedger(config, ledger) {
	const file = filePath(config, true);
	const temporary = `${file}.${process.pid}.${Date.now()}.tmp`;
	fs.writeFileSync(temporary, `${JSON.stringify(ledger, null, 2)}\n`, { mode: 0o600 });
	fs.renameSync(temporary, file);
	fs.chmodSync(file, 0o600);
}

function filePath(config = {}, ensure = false) {
	const base = ensure ? PrivateState.ensure(process.env) : PrivateState.root(process.env);
	const directory = path.join(base, "mission-project-roots");
	if (ensure) fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
	return path.join(directory, `${safeName(tunnelName(config))}.json`);
}

function tunnelName(config = {}) {
	return String(config.tunnelName || process.env.AWTSMOOS_TUNNEL_NAME || "default");
}

function safeName(value) {
	return String(value).replace(/[^a-z0-9._-]/gi, "_").slice(0, 96) || "default";
}

function trimBindings(bindings) {
	return Object.fromEntries(Object.entries(bindings)
		.sort((left, right) => String(right[1]?.updatedAt).localeCompare(String(left[1]?.updatedAt)))
		.slice(0, 64));
}

module.exports = { bind, filePath, read, readLedger, tunnelName };
