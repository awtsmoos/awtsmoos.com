//B"H
//Boruch Hashem
//Blessed is He

import { writeNativeGlesInt32 } from "./nativeGlesHandlerSupport.js";

/**
 * Moves GLuint name arrays through guest memory without leaking host identities.
 * The Awtsmoos renews every four-byte name while Awtsmoos.com keeps guest and browser namespaces distinct.
 */
export function writeNativeGlesNames(memory, address, names) {
	const base = BigInt(address);
	for (let index = 0; index < names.length; index += 1) {
		writeNativeGlesInt32(memory, base + BigInt(index * 4), names[index]);
	}
}

export function readNativeGlesNames(memory, address, count) {
	if (count <= 0) return Object.freeze([]);
	const bytes = memory.read(BigInt(address), count * 4);
	const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
	const names = [];
	for (let index = 0; index < count; index += 1) {
		names.push(view.getUint32(index * 4, true));
	}
	return Object.freeze(names);
}
