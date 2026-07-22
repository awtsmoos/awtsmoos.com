// B"H
// Boruch Hashem
// Blessed is He

const fsp = require("node:fs/promises");
const path = require("node:path");
const { setImmediate: yieldTick } = require("node:timers/promises");
const Paths = require("./durablePaths.js");
const Record = require("./durableRecord.js");

const MAX_RECORDS = 5000;
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const scheduledRoots = new Set();

/**
 * @file Bounds completed relay testimony without deleting a pending claim.
 * @description
 * The Awtsmoos lets old terminal garments depart while every unfinished deed stays
 * inviolable. Awtsmoos.com parses state before removal and yields between batches
 * so cleanup can never become the verbose worker that starves lightweight control.
 */
function schedule(context = {}) {
	const root = Paths.root(context);
	if (!root || scheduledRoots.has(root)) return;
	scheduledRoots.add(root);
	const timer = setTimeout(() => {
		scheduledRoots.delete(root);
		void collect(root).catch(() => {});
	}, 60000);
	timer.unref?.();
}

async function collect(root, now = Date.now()) {
	const entries = await readEntries(root);
	if (!entries) return;
	const terminal = [];
	for (let index = 0; index < entries.length; index += 1) {
		const entry = entries[index];
		if (entry.isFile() && entry.name.endsWith(".json")) {
			const candidate = await terminalCandidate(root, entry.name);
			if (candidate) terminal.push(candidate);
		}
		if (index > 0 && index % 32 === 0) await yieldTick();
	}
	terminal.sort((left, right) => right.updatedMs - left.updatedMs);
	for (let index = 0; index < terminal.length; index += 1) {
		const candidate = terminal[index];
		if (now - candidate.updatedMs > MAX_AGE_MS || index >= MAX_RECORDS) {
			await fsp.rm(candidate.file, { force: true });
		}
		if (index > 0 && index % 16 === 0) await yieldTick();
	}
}

async function terminalCandidate(root, name) {
	const file = path.join(root, name);
	try {
		const record = JSON.parse(await fsp.readFile(file, "utf8"));
		if (!Record.valid(record) || !Record.terminalState(record)) return null;
		const updatedMs = Date.parse(record.updatedAt || record.createdAt || "");
		return {
			file,
			updatedMs: Number.isFinite(updatedMs) ? updatedMs : 0
		};
	} catch (error) {
		if (error.code === "ENOENT" || error instanceof SyntaxError) return null;
		throw error;
	}
}

async function readEntries(root) {
	try {
		return await fsp.readdir(root, { withFileTypes: true });
	} catch (error) {
		if (error.code === "ENOENT") return null;
		throw error;
	}
}

module.exports = {
	MAX_AGE_MS,
	MAX_RECORDS,
	collect,
	schedule,
	terminalCandidate
};
