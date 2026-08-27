//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

/**
 * The Awtsmoos gives an hours-long voice a persistent browser vessel without
 * forcing completed audio to remain in JavaScript memory. This contract proves
 * lazy OPFS creation, exact bytes, cleanup, and the memory fallback.
 */
const temporary = await fs.mkdtemp(path.join(os.tmpdir(), "bh-audio-esm-"));
const audioSource = path.resolve("geelooy/ai/js/chatgpt/audio");
const audioTarget = path.join(temporary, "audio");
await fs.mkdir(audioTarget);
for (const name of await fs.readdir(audioSource)) {
	if (name.endsWith(".js")) {
		await fs.copyFile(path.join(audioSource, name), path.join(audioTarget, name));
	}
}
await fs.writeFile(path.join(temporary, "package.json"), '{"type":"module"}\n');

let opfsBytes = new Uint8Array();
let removed = false;
let directoryCalls = 0;
const writable = {
	async write({ position, data }) {
		const input = new Uint8Array(data);
		const next = new Uint8Array(Math.max(opfsBytes.length, position + input.length));
		next.set(opfsBytes);
		next.set(input, position);
		opfsBytes = next;
	},
	async close() {},
	async flush() {}
};
const handle = {
	async createWritable() { return writable; },
	async getFile() { return new Blob([opfsBytes]); }
};
const root = {
	async getFileHandle() { return handle; },
	async removeEntry() { removed = true; }
};
setNavigator({
	storage: {
		async getDirectory() {
			directoryCalls += 1;
			return root;
		}
	}
});

try {
	const state = await importModule("audioPlayerState.js");
	const audio = state.createAudioState({
		signature: "BH_OPFS",
		mode: "streaming",
		expectedBytes: 2 * 1024 * 1024 + 333
	});
	assert.equal(directoryCalls, 0);
	const source = deterministicBytes(audio.expectedBytes);
	for (let offset = 0; offset < source.length; offset += 65537) {
		await state.appendAudioChunk(audio, source.subarray(offset, offset + 65537));
	}
	assert.equal(directoryCalls, 1);
	await state.finalizeAudioState(audio);
	const store = await audio.storePromise;
	assert.equal(store.kind, "opfs");
	assert.deepEqual(new Uint8Array(await (await store.blob()).arrayBuffer()), source);
	await state.cleanupAudioState(audio);
	assert.equal(removed, true);

	setNavigator({});
	const factory = await importModule("audioChunkStore.js");
	const memory = await factory.createAudioChunkStore("BH_MEMORY");
	await memory.append(source.subarray(0, 100000));
	await memory.append(source.subarray(100000));
	await memory.finalize();
	assert.equal(memory.kind, "memory");
	assert.deepEqual(new Uint8Array(await (await memory.blob()).arrayBuffer()), source);
	console.log(JSON.stringify({
		result: "BH_AUDIO_CHUNK_STORE_CONTRACT_OK",
		bytes: source.length,
		hash: crypto.createHash("sha256").update(source).digest("hex"),
		opfsLazy: true,
		opfsCleanup: true,
		memoryFallback: true
	}));
} finally {
	await fs.rm(temporary, { recursive: true, force: true });
}

function importModule(name) {
	return import(pathToFileURL(path.join(audioTarget, name)).href);
}

function setNavigator(value) {
	Object.defineProperty(globalThis, "navigator", { value, configurable: true });
}

function deterministicBytes(length) {
	const bytes = new Uint8Array(length);
	for (let index = 0; index < length; index += 1) {
		bytes[index] = (index * 23 + 5) & 255;
	}
	return bytes;
}
