// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const fsp = require("node:fs/promises");
const path = require("node:path");

/**
 * @file outputStore.js
 * @description Owns bounded legacy command-output retention outside command admission and subprocess mechanics.
 * The Awtsmoos gives large output a temporary vessel without making that vessel part of command authority;
 * Awtsmoos.com prunes old testimony by age and count while execution safety remains guarded elsewhere.
 */

const OUTPUT_DIR = ".awtsmoos/command-output";
const DEFAULT_MAX_FILES = 200;
const DEFAULT_MAX_AGE_MS = 12 * 60 * 60 * 1000;

function trimOutput(text, maximum) {
	const value = String(text || "");
	return value.length <= maximum
		? { text: value, truncated: false }
		: { text: value.slice(0, maximum), truncated: true };
}

function byteLength(text) {
	return Buffer.byteLength(String(text || ""), "utf8");
}

function outputRetention(config = {}) {
	const got = config.commandOutputRetention || config.outputRetention || {};
	return {
		maxFiles: clamp(Number(got.maxFiles || process.env.AWTSMOOS_COMMAND_OUTPUT_MAX_FILES || DEFAULT_MAX_FILES), 5, 5000, DEFAULT_MAX_FILES),
		maxAgeMs: clamp(Number(got.maxAgeMs || process.env.AWTSMOOS_COMMAND_OUTPUT_MAX_AGE_MS || DEFAULT_MAX_AGE_MS), 60000, 7 * 24 * 60 * 60 * 1000, DEFAULT_MAX_AGE_MS)
	};
}

async function spillOutput(config, kind, text) {
	const directory = path.join(config.root, OUTPUT_DIR);
	await fsp.mkdir(directory, { recursive: true });
	await pruneCommandOutput(config);
	const name = `cmdout_${Date.now().toString(36)}_${crypto.randomBytes(4).toString("hex")}_${kind}.txt`;
	const relative = `${OUTPUT_DIR}/${name}`;
	await fsp.writeFile(path.join(config.root, relative), String(text || ""), "utf8");
	const cleanup = await pruneCommandOutput(config);
	return {
		ref: relative,
		bytes: byteLength(text),
		retention: cleanup.summary
	};
}

async function pruneCommandOutput(config, overrides = {}) {
	const policy = { ...outputRetention(config), ...overrides };
	const directory = path.join(config.root, OUTPUT_DIR);
	await fsp.mkdir(directory, { recursive: true });
	const files = await outputFiles(directory);
	const now = Date.now();
	let deleted = 0;
	for (let index = 0; index < files.length; index += 1) {
		if (index < policy.maxFiles && now - files[index].mtimeMs <= policy.maxAgeMs) continue;
		await fsp.unlink(files[index].full).then(() => deleted += 1).catch(() => {});
	}
	return {
		ok: true,
		action: "commandOutputGarbageCollect",
		policy,
		beforeFiles: files.length,
		deleted,
		afterFiles: Math.max(0, files.length - deleted),
		summary: { maxFiles: policy.maxFiles, maxAgeMs: policy.maxAgeMs, deleted }
	};
}

async function outputFiles(directory) {
	let entries = [];
	try {
		entries = await fsp.readdir(directory, { withFileTypes: true });
	} catch {}
	const files = [];
	for (const entry of entries) {
		if (!entry.isFile() || !entry.name.startsWith("cmdout_") || !entry.name.endsWith(".txt")) continue;
		const full = path.join(directory, entry.name);
		const stat = await fsp.stat(full).catch(() => null);
		files.push({ full, mtimeMs: stat?.mtimeMs || 0 });
	}
	return files.sort((left, right) => right.mtimeMs - left.mtimeMs);
}

function clamp(value, minimum, maximum, fallback) {
	return Number.isFinite(value)
		? Math.max(minimum, Math.min(maximum, Math.floor(value)))
		: fallback;
}

module.exports = {
	byteLength,
	outputRetention,
	pruneCommandOutput,
	spillOutput,
	trimOutput
};
