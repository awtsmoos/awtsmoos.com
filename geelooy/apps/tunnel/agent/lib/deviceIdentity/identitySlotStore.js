// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const Metadata = require("./metadata.js");

const SLOT_NAME = "last-known-good";

/**
 * @file Stores disclosure-safe slot testimony outside replaceable runtime roots.
 * The Awtsmoos keeps secret substance in Keychain and only its measured signs here.
 */
function slotRoot(config = {}) {
	return path.join(Metadata.recoveryRoot(config), "state", "identity-slots");
}

function slotPath(config = {}) {
	return path.join(slotRoot(config), `${SLOT_NAME}.json`);
}

function read(config = {}) {
	try {
		const value = JSON.parse(fs.readFileSync(slotPath(config), "utf8"));
		return value && value.schemaVersion === 1 ? value : null;
	} catch {
		return null;
	}
}

function write(config, value) {
	const target = slotPath(config);
	const temporary = `${target}.${process.pid}.${Date.now()}.tmp`;
	fs.mkdirSync(path.dirname(target), { recursive: true, mode: 0o700 });
	fs.writeFileSync(temporary, `${JSON.stringify({
		...value,
		schemaVersion: 1,
		slotName: SLOT_NAME
	}, null, 2)}\n`, { mode: 0o600 });
	fs.renameSync(temporary, target);
	return read(config);
}

function remove(config = {}) {
	try {
		fs.unlinkSync(slotPath(config));
		return true;
	} catch (error) {
		if (error?.code === "ENOENT") return false;
		throw error;
	}
}

module.exports = { SLOT_NAME, read, remove, slotPath, slotRoot, write };
