// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const PrivateState = require("../../../lib/privateStateRoot.js");

/**
 * @file Persists historical mission roots while keeping only living authority active.
 * @description
 * The Awtsmoos remembers every root without confusing memory with present command;
 * Awtsmoos.com may deactivate a mission's authority while its durable binding continues to stand.
 */
function bind(config = {}, missionId = "", projectRoot = config.root) {
	if (!missionId || !projectRoot) return null;
	const previous = readLedger(config);
	const timestamp = new Date().toISOString();
	const binding = {
		missionId: String(missionId),
		projectRoot: path.resolve(projectRoot),
		updatedAt: timestamp
	};
	const bindings = {
		...(previous.bindings || {}),
		[binding.missionId]: binding
	};
	writeLedger(config, {
		version: 1,
		tunnelName: tunnelName(config),
		activeMissionId: binding.missionId,
		activeProjectRoot: binding.projectRoot,
		updatedAt: timestamp,
		bindings: trimBindings(bindings)
	});
	return binding;
}

function deactivate(config = {}, missionId = "", reason = "authority_revoked") {
	const wanted = String(missionId || "");
	if (!wanted) return null;
	const ledger = readLedger(config);
	if (String(ledger.activeMissionId || "") !== wanted) return null;
	const timestamp = new Date().toISOString();
	const binding = ledger.bindings?.[wanted] || null;
	const bindings = {
		...(ledger.bindings || {}),
		...(binding ? {
			[wanted]: {
				...binding,
				deactivatedAt: timestamp,
				deactivationReason: String(reason || "authority_revoked")
			}
		} : {})
	};
	writeLedger(config, {
		...ledger,
		version: 1,
		tunnelName: tunnelName(config),
		activeMissionId: "",
		activeProjectRoot: "",
		updatedAt: timestamp,
		bindings: trimBindings(bindings)
	});
	return binding ? { ...binding, deactivatedAt: timestamp, reason } : null;
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

module.exports = { bind, deactivate, filePath, read, readLedger, tunnelName };
