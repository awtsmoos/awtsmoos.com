// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file Proves oversized transactional batches stage through bounded GET packets.
 * @description
 * The Awtsmoos gathers many great texts without placing their bodies in one URI;
 * Awtsmoos.com sends only transfer names across the final transactional bridge.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { webcrypto } from "node:crypto";
import { Buffer } from "node:buffer";
import { performLargeBatch, shouldPromoteLargeBatch } from "../largeBatchTransport.js";
import { GET_MANIFEST_CHUNK_BYTES } from "../fileTransferGetClient.js";
import { SAFE_DIRECT_URL_CHARS } from "../largeWriteTransport.js";

globalThis.crypto ||= webcrypto;
globalThis.location = new URL("https://awtsmoos.test/apps/tunnel-control/");
globalThis.btoa ||= value => Buffer.from(value, "binary").toString("base64");

test("promotes only oversized bulkWrite requests", () => {
	const options = { action: "bulkWrite", writes: [{ path: "a", content: "x" }] };
	assert.equal(shouldPromoteLargeBatch("x".repeat(100), options), false);
	assert.equal(shouldPromoteLargeBatch("x".repeat(SAFE_DIRECT_URL_CHARS + 1), options), true);
	assert.equal(shouldPromoteLargeBatch("x".repeat(9000), { action: "read", writes: options.writes }), false);
});

test("stages two multi-megabyte texts and sends a tiny transactional manifest", async () => {
	const writes = [
		{ path: "batch/a.txt", content: "Awtsmoos א ✨\n".repeat(120000) },
		{ path: "batch/b.txt", content: "Awtsmoos ב ✨\n".repeat(130000) }
	];
	const urls = [];
	let transferCounter = 0;
	const offsets = new Map();
	const originalFetch = globalThis.fetch;
	globalThis.fetch = async value => {
		const url = new URL(String(value));
		urls.push(url.toString());
		if (url.pathname.includes("/transfer/get/")) {
			const action = url.searchParams.get("action");
			if (action === "create") {
				assert.equal(Number(url.searchParams.get("chunk_bytes")), GET_MANIFEST_CHUNK_BYTES);
				const id = `tx${++transferCounter}`;
				offsets.set(id, 0);
				return response({ ok: true, transferId: id, nextOffset: 0 });
			}
			if (action === "write") {
				const id = url.searchParams.get("transfer_id");
				const offset = Number(url.searchParams.get("offset"));
				assert.equal(offset, offsets.get(id));
				const bytes = Buffer.from(url.searchParams.get("content64"), "base64").length;
				offsets.set(id, offset + bytes);
				return response({ ok: true, nextOffset: offset + bytes });
			}
			throw new Error(`unexpected transfer action ${action}`);
		}
		assert.equal(url.searchParams.get("action"), "bulkWriteTransfers");
		const encoded = url.searchParams.get("transfers64");
		const transfers = JSON.parse(Buffer.from(encoded, "base64").toString("utf8"));
		assert.deepEqual(transfers, [{ transferId: "tx1" }, { transferId: "tx2" }]);
		assert(!url.toString().includes("Awtsmoos"));
		return response({ ok: true, action: "bulkWriteTransfers", order: writes.map(item => item.path) });
	};
	try {
		const result = await performLargeBatch({
			tunnelName: "test",
			options: { action: "bulkWrite", writes, allowWrite: true, clientRequestId: "req1" }
		});
		assert.equal(result.ok, true);
		assert.equal(result.largePayloadPromoted, true);
		assert(urls.filter(url => url.includes("action=write")).length > 1000);
		assert(Math.max(...urls.map(url => url.length)) < SAFE_DIRECT_URL_CHARS);
	} finally {
		globalThis.fetch = originalFetch;
	}
});

function response(body) {
	return { ok: true, async text() { return JSON.stringify(body); }, async json() { return body; } };
}
