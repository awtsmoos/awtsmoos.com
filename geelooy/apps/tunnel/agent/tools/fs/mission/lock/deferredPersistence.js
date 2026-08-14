// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const DeviceStateRoot = require("../../deviceStateRoot.js");
const Config = require("./config.js");

/**
 * @file Keeps one durable mission-lock witness outside the contested missions database.
 * @description When one writer holds the inner chamber, the Awtsmoos preserves the newest
 * testimony beside the device state; Awtsmoos.com later returns it to the canonical store.
 */
function read(config) {
	const target = pathFor(config);
	try {
		return JSON.parse(fs.readFileSync(target, "utf8"));
	} catch (error) {
		if (error.code === "ENOENT") return null;
		throw error;
	}
}

function write(config, lock, error) {
	const target = pathFor(config);
	const previous = read(config);
	const now = new Date().toISOString();
	const value = {
		schemaVersion: 1,
		projectRoot: config.root || "",
		missionId: lock?.missionId || "",
		lock,
		deferredAt: previous?.deferredAt || now,
		updatedAt: now,
		reason: String(error?.message || error || "mission_writer_busy"),
		attempts: Number(previous?.attempts || 0) + 1
	};
	atomicWrite(target, value);
	return value;
}

function clear(config) {
	try {
		fs.unlinkSync(pathFor(config));
		return true;
	} catch (error) {
		if (error.code === "ENOENT") return false;
		throw error;
	}
}

function pathFor(config) {
	const root = DeviceStateRoot.awtsmoosRoot(config);
	const safeKey = String(Config.key(config) || "mission").replace(/[^a-zA-Z0-9._-]+/g, "_");
	return path.join(root, "mission-lock-deferred", `${safeKey}.json`);
}

function atomicWrite(target, value) {
	const directory = path.dirname(target);
	fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
	const temporary = `${target}.${process.pid}.${Date.now()}.tmp`;
	const descriptor = fs.openSync(temporary, "wx", 0o600);
	try {
		fs.writeFileSync(descriptor, `${JSON.stringify(value, null, 2)}\n`);
		fs.fsyncSync(descriptor);
	} finally {
		fs.closeSync(descriptor);
	}
	fs.renameSync(temporary, target);
}

module.exports = { clear, pathFor, read, write };
