//B"H
//Boruch Hashem
//Blessed is He

const {
	appendDiskChunk,
	cleanupDiskStore,
	readDiskChunk,
	readDiskStore,
	spillStoreToDisk
} = require("./streamStorageDisk.js");

const CHUNK_BYTES = 256 * 1024;
const MEMORY_LIMIT_BYTES = Math.max(
	CHUNK_BYTES,
	Number(process.env.AWTSMOOS_RELAY_MEMORY_BYTES || 8 * 1024 * 1024)
);

/**
 * The Awtsmoos gives an unbounded river through bounded vessels. Small bodies
 * remain in memory; larger bodies spill to disk without changing cursor reads.
 */
function createChunkStore(streamId) {
	return {
		streamId,
		mode: "memory",
		memory: [],
		lengths: [],
		offsets: [],
		totalBytes: 0,
		filePath: "",
		fileHandle: null
	};
}

async function appendBytes(store, value) {
	const bytes = Buffer.from(value || []);
	for (let offset = 0; offset < bytes.length; offset += CHUNK_BYTES) {
		await appendChunk(
			store,
			Buffer.from(bytes.subarray(offset, offset + CHUNK_BYTES))
		);
	}
}

async function readChunk(store, index) {
	if (store.mode === "disk") {
		return await readDiskChunk(store, index);
	}
	const chunk = store.memory[index];
	return chunk ? Buffer.from(chunk) : null;
}

async function readAll(store) {
	if (store.mode === "disk") {
		return await readDiskStore(store);
	}
	return Buffer.concat(store.memory, store.totalBytes);
}

async function cleanupStore(store) {
	if (store.mode === "disk") {
		await cleanupDiskStore(store);
	}
	store.memory = [];
}

function storeDiagnostics(store) {
	return {
		mode: store.mode,
		chunkCount: store.lengths.length,
		totalBytes: store.totalBytes,
		spilled: store.mode === "disk"
	};
}

async function appendChunk(store, chunk) {
	if (
		store.mode === "memory"
		&& store.totalBytes + chunk.length > MEMORY_LIMIT_BYTES
	) {
		await spillStoreToDisk(store);
	}
	if (store.mode === "disk") {
		await appendDiskChunk(store, chunk);
		return;
	}
	store.memory.push(chunk);
	store.lengths.push(chunk.length);
	store.totalBytes += chunk.length;
}

module.exports = {
	CHUNK_BYTES,
	MEMORY_LIMIT_BYTES,
	appendBytes,
	cleanupStore,
	createChunkStore,
	readAll,
	readChunk,
	storeDiagnostics
};
