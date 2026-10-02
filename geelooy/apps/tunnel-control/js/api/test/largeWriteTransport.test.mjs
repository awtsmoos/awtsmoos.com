// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file Proves multi-megabyte GET-only writes never become one giant URI.
 * @description
 * The Awtsmoos lets Awtsmoos.com divide a vast text into faithful measured rivers;
 * manifest rhythm stays native-valid while every physical GET remains small and proven.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { webcrypto } from "node:crypto";
import { Buffer } from "node:buffer";
import { GET_MANIFEST_CHUNK_BYTES, uploadFileByGet } from "../fileTransferGetClient.js";
import { SAFE_DIRECT_URL_CHARS, shouldPromoteLargeWrite } from "../largeWriteTransport.js";
import { bytesFrom, sha256Hex } from "../transferBytes.js";

globalThis.crypto ||= webcrypto;
globalThis.location = new URL("https://awtsmoos.test/apps/tunnel-control/");
globalThis.btoa ||= value => Buffer.from(value, "binary").toString("base64");

test("promotes oversized writes but leaves small writes direct", () => {
	assert.equal(shouldPromoteLargeWrite("x".repeat(100), { action: "write", content: "hi" }), false);
	assert.equal(
		shouldPromoteLargeWrite("x".repeat(SAFE_DIRECT_URL_CHARS + 1), { action: "write", content: "hi" }),
		true
	);
	assert.equal(shouldPromoteLargeWrite("x".repeat(9000), { action: "read", content: "hi" }), false);
});

test("moves three MiB of Unicode through bounded GET packets without byte loss", async () => {
	const text = "B\"H · Awtsmoos שלום ✨\n".repeat(150000);
	const source = bytesFrom(text);
	assert(source.length > 3 * 1024 * 1024);
	const received = new Map();
	const urls = [];
	const expectedSha256 = await sha256Hex(source);
	const originalFetch = globalThis.fetch;
	globalThis.fetch = async value => {
		const url = new URL(String(value));
		urls.push(url.toString());
		const action = url.searchParams.get("action");
		if (action === "create") {
			assert.equal(Number(url.searchParams.get("chunk_bytes")), GET_MANIFEST_CHUNK_BYTES);
			return response({ ok: true, transferId: "tx1", nextOffset: 0 });
		}
		if (action === "write") {
			const offset = Number(url.searchParams.get("offset"));
			const chunk = Buffer.from(url.searchParams.get("content64"), "base64");
			assert.equal(await sha256Hex(chunk), url.searchParams.get("sha256"));
			received.set(offset, chunk);
			return response({ ok: true, nextOffset: offset + chunk.length });
		}
		if (action === "commit") {
			return response({ ok: true, transferId: "tx1", bytes: source.length, sha256: expectedSha256 });
		}
		throw new Error(`unexpected action ${action}`);
	};
	try {
		const result = await uploadFileByGet({ tunnelName: "test", path: "/tmp/large.txt", bytes: source });
		const rebuilt = Buffer.concat([...received.entries()].sort((a, b) => a[0] - b[0]).map(entry => entry[1]));
		assert.deepEqual(rebuilt, Buffer.from(source));
		assert.equal(result.sha256, expectedSha256);
		assert(urls.length > 1000);
		assert(Math.max(...urls.map(url => url.length)) < SAFE_DIRECT_URL_CHARS);
	} finally {
		globalThis.fetch = originalFetch;
	}
});

function response(body) {
	return { ok: true, async json() { return body; } };
}
