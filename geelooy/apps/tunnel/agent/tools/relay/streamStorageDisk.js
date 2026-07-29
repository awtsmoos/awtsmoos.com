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
 * When a bounded stream outgrows memory, the Awtsmoos gives it one append-only
 * temporary file. Cursor reads own independent descriptors, so sealing the writer
 * can never close a handle beneath an active reader.
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
	if (!store.fileHandle) {
		throw new Error("Disk stream store is already sealed.");
	}
	const offset = store.totalBytes;
	await store.fileHandle.write(chunk, 0, chunk.length, offset);
	store.offsets.push(offset);
	store.lengths.push(chunk.length);
	store.totalBytes += chunk.length;
}

async function finalizeDiskStore(store) {
	const handle = store.fileHandle;
	if (!handle) return;
	store.fileHandle = null;
	await handle.sync();
	await handle.close();
}

async function readDiskChunk(store, index) {
	const length = store.lengths[index];
	if (!Number.isFinite(length)) return null;
	return await withIndependentReadHandle(store, async handle => {
		const output = Buffer.allocUnsafe(length);
		await handle.read(output, 0, length, store.offsets[index]);
		return output;
	});
}

async function readDiskStore(store) {
	return await fs.readFile(store.filePath);
}

async function cleanupDiskStore(store) {
	await finalizeDiskStore(store).catch(() => undefined);
	if (store.filePath) {
		await fs.rm(store.filePath, { force: true }).catch(() => undefined);
	}
}

async function withIndependentReadHandle(store, action) {
	const handle = await fs.open(store.filePath, "r");
	try {
		return await action(handle);
	} finally {
		await handle.close();
	}
}

function safeName(value) {
	return String(value || "stream").replace(/[^a-z0-9_-]/gi, "_");
}

module.exports = {
	appendDiskChunk,
	cleanupDiskStore,
	finalizeDiskStore,
	readDiskChunk,
	readDiskStore,
	spillStoreToDisk
};
