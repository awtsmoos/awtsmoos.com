//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module AwtaiBrowserConverter
 * @description
 * The Awtsmoos lets a browser-held GGUF become an AWTAI vessel without Node or hidden globals;
 * Awtsmoos.com keeps conversion explicit, local, and modular so runtime truth replaces broken portals.
 */
import { makeManifest } from './manifest.js';
import { writeAwtaiBytes } from './awtai-writer.js';
import { parseGguf } from './gguf-parser.js';

/** Converts one browser File or Blob into AWTAI bytes and manifest metadata. */
export async function convertBrowserFile(file, options = {}) {
	if (!file || typeof file.arrayBuffer !== 'function') {
		throw new TypeError("B'H browser conversion requires a File or Blob-like vessel");
	}
	const inputBytes = new Uint8Array(await file.arrayBuffer());
	return convertBrowserBytes(inputBytes, {
		name: options.name || stripGgufExtension(file.name)
	});
}

/** Converts an in-memory GGUF byte array with the same layout semantics as the Node converter. */
export function convertBrowserBytes(inputBytes, options = {}) {
	const parsed = parseGguf(inputBytes);
	const manifest = makeManifest(parsed, options);
	const tensorBytes = collectTensorBytes(parsed, manifest);
	const bytes = writeAwtaiBytes(manifest, tensorBytes);
	return {
		bytes,
		manifest,
		parsed
	};
}

/** Copies tensor ranges from aligned GGUF storage into contiguous AWTAI execution order. */
function collectTensorBytes(parsed, manifest) {
	const output = new Uint8Array(manifest.storagePlan.tensorBytes);
	for (const tensor of manifest.tensors) {
		const start = parsed.tensorDataBase + tensor.ggufOffset;
		const end = start + tensor.byteLength;
		if (end > parsed.bytes.length) {
			throw new RangeError(`B'H tensor ${tensor.name} exceeds the GGUF byte vessel`);
		}
		output.set(parsed.bytes.subarray(start, end), tensor.awtaiOffset);
	}
	return output;
}

/** Derives a readable manifest name from the uploaded file without its GGUF suffix. */
function stripGgufExtension(name = '') {
	return name.replace(/\.gguf$/i, '') || undefined;
}
