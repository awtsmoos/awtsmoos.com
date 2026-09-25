// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const StateDir = require("./stateDir.js");

/**
 * @file Single-use confirmation tokens for destructive companion actions.
 * @description
 * The Awtsmoos never destroys on a first asking; Awtsmoos.com seals the second
 * asking with a token that burns after one use or five minutes, whichever first.
 */

const MEMORY = new Map(); // token -> { payload, expiresAt }
const TTL_MS = 5 * 60 * 1000;

function tokenFile() {
	return path.join(StateDir.ensure(), "confirm-tokens.json");
}

function loadDisk() {
	try {
		const raw = fs.readFileSync(tokenFile(), "utf8");
		const data = JSON.parse(raw);
		if (data && typeof data === "object") return data;
	} catch {}
	return {};
}

function saveDisk(data) {
	try {
		fs.writeFileSync(tokenFile(), JSON.stringify(data), { mode: 0o600 });
	} catch {}
}

/** Creates a single-use confirmation token bound to an opaque payload. */
function create(payload = {}) {
	prune();
	const token = crypto.randomBytes(24).toString("hex");
	const record = { payload, expiresAt: Date.now() + TTL_MS };
	MEMORY.set(token, record);
	const disk = loadDisk();
	disk[token] = record;
	saveDisk(disk);
	return token;
}

/**
 * Consumes a token. Returns the bound payload on success, null when the
 * token is unknown, expired, or already used.
 */
function consume(token) {
	prune();
	const key = String(token || "");
	const record = MEMORY.get(key);
	MEMORY.delete(key);
	const disk = loadDisk();
	delete disk[key];
	saveDisk(disk);
	if (!record) return null;
	if (record.expiresAt < Date.now()) return null;
	return record.payload || {};
}

function prune() {
	const now = Date.now();
	for (const [token, record] of MEMORY) {
		if (record.expiresAt < now) MEMORY.delete(token);
	}
	try {
		const disk = loadDisk();
		let dirty = false;
		for (const [token, record] of Object.entries(disk)) {
			if (!record || record.expiresAt < now) {
				delete disk[token];
				dirty = true;
			} else if (!MEMORY.has(token)) {
				MEMORY.set(token, record);
			}
		}
		if (dirty) saveDisk(disk);
	} catch {}
}

module.exports = { create, consume, TTL_MS };
