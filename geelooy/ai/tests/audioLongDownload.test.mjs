//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";

/**
 * The Awtsmoos proves that a long audio river keeps every byte and that the
 * visible Arbor garment becomes the exact `fathom` payload in Awtsmoos.com.
 */
test("Arbor normalizes to the fathom synthesis identifier", async () => {
	const environment = await createAudioEnvironment();
	try {
		const catalog = await environment.importModule("audioCatalog.js");
		assert.equal(catalog.normalizeAudioVoice("arbor"), "fathom");
		assert.equal(catalog.normalizeAudioVoice("fathom"), "fathom");
		assert.equal(catalog.audioVoiceLabel("fathom"), "Arbor");
		assert.ok(catalog.AUDIO_VOICES.includes("fathom"));
		assert.ok(!catalog.AUDIO_VOICES.includes("arbor"));
	} finally {
		await environment.cleanup();
	}
});

test("complete stream receiver preserves every long-audio packet", async () => {
	const environment = await createAudioEnvironment();
	try {
		setNavigator({});
		const module = await environment.importModule("audioStreamDownload.js");
		const source = deterministicBytes(6 * 1024 * 1024 + 777);
		const packets = splitBytes(source, 65537);
		const progress = [];
		const complete = await module.receiveCompleteAudioStream({
			format: "mp3",
			mime: "audio/mpeg",
			response: fakeResponse(packets, source.length)
		}, {
			signature: "BH_LONG_AUDIO",
			format: "mp3",
			onProgress: bytes => progress.push(bytes)
		});
		const blob = await complete.store.blob(complete.mime);
		assert.equal(complete.bytes, source.length);
		assert.equal(complete.expectedBytes, source.length);
		assert.equal(progress.at(-1), source.length);
		assert.deepEqual(new Uint8Array(await blob.arrayBuffer()), source);
		await complete.store.cleanup();
	} finally {
		await environment.cleanup();
	}
});

async function createAudioEnvironment() {
	const temporary = await fs.mkdtemp(path.join(os.tmpdir(), "bh-long-audio-"));
	const source = path.resolve("geelooy/ai/js/chatgpt/audio");
	const target = path.join(temporary, "audio");
	await fs.mkdir(target);
	for (const name of await fs.readdir(source)) {
		if (name.endsWith(".js")) {
			await fs.copyFile(path.join(source, name), path.join(target, name));
		}
	}
	await fs.writeFile(path.join(temporary, "package.json"), '{"type":"module"}\n');
	return {
		importModule: name => import(pathToFileURL(path.join(target, name)).href),
		cleanup: () => fs.rm(temporary, { recursive: true, force: true })
	};
}

function fakeResponse(packets, length) {
	let index = 0;
	return {
		headers: new Headers({
			"content-length": String(length),
			"content-type": "audio/mpeg"
		}),
		body: {
			getReader() {
				return {
					async read() {
						return index < packets.length
							? { done: false, value: packets[index++] }
							: { done: true, value: undefined };
					}
				};
			}
		}
	};
}

function splitBytes(bytes, size) {
	const packets = [];
	for (let offset = 0; offset < bytes.length; offset += size) {
		packets.push(bytes.slice(offset, offset + size));
	}
	return packets;
}

function deterministicBytes(length) {
	const bytes = new Uint8Array(length);
	for (let index = 0; index < length; index += 1) {
		bytes[index] = (index * 31 + 11) & 255;
	}
	return bytes;
}

function setNavigator(value) {
	Object.defineProperty(globalThis, "navigator", { value, configurable: true });
}
