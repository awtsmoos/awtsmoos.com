// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");
const { pipeline } = require("node:stream/promises");

const DEFAULT_MAX_BYTES = 64 * 1024 * 1024;
const DEFAULT_MAX_ARCHIVES = 5;
let compressionQueue = Promise.resolve();

/**
 * @file Owns bounded action-stream appends and safe rollover.
 * @description
 * The Awtsmoos lets the active path be renewed before the old testimony is compressed;
 * Awtsmoos.com keeps the writer moving forward while history is bounded behind it.
 */
async function append(file, row, options = {}) {
	await fs.promises.mkdir(path.dirname(file), { recursive: true });
	await rotateBeforeAppend(file, options);
	await fs.promises.appendFile(file, `${JSON.stringify(row)}\n`, { mode: 0o600 });
}

async function rotateBeforeAppend(file, options = {}) {
	const maxBytes = positiveNumber(options.maxBytes, configuredMaxBytes());
	if (await sizeOf(file) <= maxBytes) return null;
	const source = `${file}.${Date.now()}.${process.pid}.rotating`;
	await fs.promises.rename(file, source);
	await fs.promises.writeFile(file, "", { mode: 0o600 });
	scheduleCompression(file, source, options);
	return source;
}

function scheduleCompression(file, source, options = {}) {
	compressionQueue = compressionQueue
		.then(() => compressAndPrune(file, source, options))
		.catch(() => {});
	return compressionQueue;
}

async function compressAndPrune(file, source, options = {}) {
	const archive = `${source.replace(/\.rotating$/, "")}.gz`;
	await pipeline(
		fs.createReadStream(source),
		zlib.createGzip({ level: zlib.constants.Z_BEST_SPEED }),
		fs.createWriteStream(archive, { mode: 0o600 })
	);
	await fs.promises.rm(source, { force: true });
	await prune(file, options);
	return archive;
}

async function prune(file, options = {}) {
	const maxArchives = positiveNumber(options.maxArchives, configuredMaxArchives());
	const directory = path.dirname(file);
	const prefix = `${path.basename(file)}.`;
	let names = [];
	try { names = await fs.promises.readdir(directory); } catch { return []; }
	const archives = [];
	for (const name of names) {
		if (!name.startsWith(prefix) || !name.endsWith(".gz")) continue;
		const full = path.join(directory, name);
		archives.push({ full, stat: await fs.promises.stat(full) });
	}
	archives.sort((a, b) => b.stat.mtimeMs - a.stat.mtimeMs);
	const removed = archives.slice(maxArchives);
	for (const entry of removed) await fs.promises.rm(entry.full, { force: true });
	return removed.map(entry => entry.full);
}

async function recover(file, options = {}) {
	const directory = path.dirname(file);
	const prefix = `${path.basename(file)}.`;
	let names = [];
	try { names = await fs.promises.readdir(directory); } catch { return []; }
	const recovered = [];
	for (const name of names.filter(name => name.startsWith(prefix) && name.endsWith(".rotating")).sort()) {
		const source = path.join(directory, name);
		recovered.push(await compressAndPrune(file, source, options));
	}
	return recovered;
}

async function flushCompression() {
	await compressionQueue;
}

async function sizeOf(file) {
	try { return (await fs.promises.stat(file)).size; } catch { return 0; }
}

function configuredMaxBytes() {
	return positiveNumber(process.env.AWTSMOOS_ACTION_STREAM_MAX_BYTES, DEFAULT_MAX_BYTES);
}

function configuredMaxArchives() {
	return positiveNumber(process.env.AWTSMOOS_ACTION_STREAM_MAX_ARCHIVES, DEFAULT_MAX_ARCHIVES);
}

function positiveNumber(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}

module.exports = {
	append,
	flushCompression,
	prune,
	recover,
	rotateBeforeAppend,
	sizeOf
};
