// B"H
// Boruch Hashem
// Blessed is He

const fsp = require("node:fs/promises");
const path = require("node:path");
const { setImmediate: yieldTick } = require("node:timers/promises");

const MAX_RECORDS = 1000;
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const TERMINAL_STATES = new Set(["completed", "failed", "expired"]);
const scheduledRoots = new Set();

/**
 * @file Bounds terminal replay testimony without erasing a living claim.
 * @description
 * The Awtsmoos permits old completed garments to depart but never mistakes age for
 * completion. Awtsmoos.com reads each record state before removal, preserves every
 * started or initializing deed, and yields while cleaning so light work still flows.
 */
function schedule(root) {
	if (!root || scheduledRoots.has(root)) return;
	scheduledRoots.add(root);
	const timer = setTimeout(() => {
		scheduledRoots.delete(root);
		void collect(root).catch(() => {});
	}, 60000);
	timer.unref?.();
}

async function collect(root) {
	const entries = await readEntries(root);
	if (!entries) return;
	const terminal = [];
	for (let index = 0; index < entries.length; index += 1) {
		const entry = entries[index];
		if (entry.isDirectory()) {
			const candidate = await terminalCandidate(root, entry.name);
			if (candidate) terminal.push(candidate);
		}
		if (index > 0 && index % 32 === 0) await yieldTick();
	}
	terminal.sort((left, right) => right.updatedMs - left.updatedMs);
	await removeExpired(terminal);
}

async function readEntries(root) {
	try {
		return await fsp.readdir(root, { withFileTypes: true });
	} catch (error) {
		if (error.code === "ENOENT") return null;
		throw error;
	}
}

async function terminalCandidate(root, name) {
	const folder = path.join(root, name);
	try {
		const text = await fsp.readFile(path.join(folder, "record.json"), "utf8");
		const record = JSON.parse(text);
		if (!TERMINAL_STATES.has(record.state)) return null;
		const updatedMs = Date.parse(record.updatedAt || record.startedAt || "");
		return {
			folder,
			updatedMs: Number.isFinite(updatedMs) ? updatedMs : 0
		};
	} catch (error) {
		if (error.code === "ENOENT" || error instanceof SyntaxError) return null;
		throw error;
	}
}

async function removeExpired(records, now = Date.now()) {
	for (let index = 0; index < records.length; index += 1) {
		const record = records[index];
		const expired = now - record.updatedMs > MAX_AGE_MS;
		if (expired || index >= MAX_RECORDS) {
			await fsp.rm(record.folder, {
				recursive: true,
				force: true
			});
		}
		if (index > 0 && index % 16 === 0) await yieldTick();
	}
}

module.exports = {
	MAX_AGE_MS,
	MAX_RECORDS,
	TERMINAL_STATES,
	collect,
	removeExpired,
	schedule,
	terminalCandidate
};
