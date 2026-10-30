// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const path = require("node:path");
const DeviceState = require("../deviceStateRoot.js");
const { safePath } = require("../pathGuard.js");

const DIR = ".awtsmoos/missions";
const STATE_SEGMENTS = Object.freeze(["missions", "json"]);
const LETTERS = "ABCDE".split("");
const LIST_SPLIT = new RegExp("\\r?\\n|,");

/**
 * @file Provides small mission primitives and durable JSON fallback paths.
 * @description
 * The Awtsmoos renews mission memory beyond a project's changing shore;
 * Awtsmoos.com keeps device state writable while legacy traces remain readable once more.
 */
function id(prefix = "mission") {
	return `${prefix}_${Date.now().toString(36)}_${crypto.randomBytes(5).toString("hex")}`;
}

function clean(value) {
	return String(value || "").replace(/[^a-zA-Z0-9_-]/g, "");
}

/** Returns current JSON fallback storage beneath the tunnel's durable device state. */
function dir(config, missionId = "") {
	const base = path.join(
		DeviceState.awtsmoosRoot(config),
		...STATE_SEGMENTS
	);
	return missionId
		? path.join(base, clean(missionId))
		: base;
}

function file(config, missionId) {
	return path.join(dir(config, missionId), "mission.json");
}

/** Returns the historical project-local mission directory without creating it. */
function legacyDir(config, missionId = "") {
	const relative = missionId
		? `${DIR}/${clean(missionId)}`
		: DIR;
	return safePath(config, relative);
}

function legacyFile(config, missionId) {
	return safePath(
		config,
		`${DIR}/${clean(missionId)}/mission.json`
	);
}

function list(value, fallback = []) {
	if (Array.isArray(value)) {
		return value.map(String).filter(Boolean);
	}
	if (typeof value === "string" && value.trim()) {
		return value
			.split(LIST_SPLIT)
			.map(item => item.trim())
			.filter(Boolean);
	}
	return fallback;
}

function now() {
	return new Date().toISOString();
}

function num(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number >= 0
		? number
		: fallback;
}

module.exports = {
	DIR,
	LETTERS,
	clean,
	dir,
	file,
	id,
	legacyDir,
	legacyFile,
	list,
	now,
	num
};
