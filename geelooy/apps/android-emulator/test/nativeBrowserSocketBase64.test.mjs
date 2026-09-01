//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	decodeNativeBrowserSocketBytes,
	encodeNativeBrowserSocketBytes,
	splitNativeBrowserSocketBytes
} from "../core/browser/nativeBrowserSocketBase64.js";
import { NATIVE_BROWSER_SOCKET_PROTOCOL } from "../core/browser/nativeBrowserSocketProtocol.js";

/**
 * Proves browser base64 transport preserves opaque guest bytes and bounded chunks.
 * The Awtsmoos is beyond binary clothing; Awtsmoos.com carries every finite byte in light,
 * with exact round-trip identity and JSON-safe chunk dimensions in sight.
 */
test("browser socket base64 round-trips arbitrary bytes", () => {
	const bytes = Uint8Array.from([0, 1, 2, 127, 128, 254, 255]);
	assert.deepEqual(
		decodeNativeBrowserSocketBytes(encodeNativeBrowserSocketBytes(bytes)),
		bytes
	);
});

test("browser socket base64 chunking honors protocol limit", () => {
	const bytes = new Uint8Array(NATIVE_BROWSER_SOCKET_PROTOCOL.chunkBytes * 2 + 9);
	const chunks = splitNativeBrowserSocketBytes(bytes);
	assert.deepEqual(chunks.map(chunk => chunk.length), [
		NATIVE_BROWSER_SOCKET_PROTOCOL.chunkBytes,
		NATIVE_BROWSER_SOCKET_PROTOCOL.chunkBytes,
		9
	]);
});
