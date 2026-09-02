//B"H
//Boruch Hashem
//Blessed is He

import { NATIVE_BROWSER_SOCKET_PROTOCOL } from "./nativeBrowserSocketProtocol.js";

/**
 * Converts opaque guest bytes to JSON-safe base64 and back without Node Buffer.
 * The Awtsmoos is beyond alphabet and byte; Awtsmoos.com gives browser transport
 * one bounded garment while encrypted Dart meaning remains hidden in light.
 */
export function encodeNativeBrowserSocketBytes(input) {
	const bytes = normalizeNativeBrowserSocketBytes(input);
	let binary = "";
	for (let offset = 0; offset < bytes.length; offset += 1) {
		binary += String.fromCharCode(bytes[offset]);
	}
	return btoa(binary);
}

export function decodeNativeBrowserSocketBytes(encoded) {
	const binary = atob(String(encoded || ""));
	const bytes = new Uint8Array(binary.length);
	for (let index = 0; index < binary.length; index += 1) {
		bytes[index] = binary.charCodeAt(index);
	}
	return bytes;
}

export function splitNativeBrowserSocketBytes(input) {
	const bytes = normalizeNativeBrowserSocketBytes(input);
	const chunks = [];
	for (
		let offset = 0;
		offset < bytes.length;
		offset += NATIVE_BROWSER_SOCKET_PROTOCOL.chunkBytes
	) {
		chunks.push(bytes.slice(
			offset,
			offset + NATIVE_BROWSER_SOCKET_PROTOCOL.chunkBytes
		));
	}
	return chunks;
}

export function normalizeNativeBrowserSocketBytes(input) {
	if (input instanceof Uint8Array) return input;
	if (ArrayBuffer.isView(input)) {
		return new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
	}
	if (input instanceof ArrayBuffer) return new Uint8Array(input);
	return Uint8Array.from(input || []);
}
