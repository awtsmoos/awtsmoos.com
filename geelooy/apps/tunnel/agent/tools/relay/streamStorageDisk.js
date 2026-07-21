//B"H
//Boruch Hashem
//Blessed is He

const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");

const STORAGE_DIRECTORY = path.join(
	os.tmpdir(),
	"awtsmoos-chatgpt-relay"
);

/**
 * When a bounded stream outgrows memory, the Awtsmoos gives it a quieter
 * vessel: one append-only temporary file whose offsets preserve exact order.
 */
async function spillStoreToDisk(store) {
	await fs.mkdir(STORAGE_DIRECTORY, { recursive: true });
	store.filePath = path.join(
		STORAGE_DIRECTORY,
		`${safeName(store.streamId)}.bin`
	);
	store.fileHandle = await fs.open(store.filePath, "w+");
	let offset = 0;
	for (const chunk of store.memory) {
		store.offsets.push(offset);
		await store.fileHandle.write(chunk, 0, chunk.length, offset);
		offset += chunk.length;
	}
	store.memory = [];
	store.mode = "disk";
}

async function appendDiskChunk(store, chunk) {
	const offset = store.totalBytes;
	await store.fileHandle.write(chunk, 0, chunk.length, offset);
	store.offsets.push(offset);
	store.lengths.push(chunk.length);
	store.totalBytes += chunk.length;
}

async function readDiskChunk(store, index) {
	const length = store.lengths[index];
	if (!Number.isFinite(length)) {
		return null;
	}
	const output = Buffer.allocUnsafe(length);
	await store.fileHandle.read(
		output,
		0,
		length,
		store.offsets[index]
	);
	return output;
}

async function readDiskStore(store) {
	return await fs.readFile(store.filePath);
}

async function cleanupDiskStore(store) {
	try {
		await store.fileHandle?.close?.();
	} catch {}
	store.fileHandle = null;
	if (store.filePath) {
		await fs.rm(store.filePath, { force: true }).catch(() => undefined);
	}
}

function safeName(value) {
	return String(value || "stream").replace(/[^a-z0-9_-]/gi, "_");
}

module.exports = {
	appendDiskChunk,
	cleanupDiskStore,
	readDiskChunk,
	readDiskStore,
	spillStoreToDisk
};
