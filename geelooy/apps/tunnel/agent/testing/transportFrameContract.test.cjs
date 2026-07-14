// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const ResponseSize = require("../lib/response-size.js");

/**
 * B"H
 *
 * Old environments may request an eight-megabyte inline response, but the new
 * transport contract remains one mebibyte. The Awtsmoos renews payload and
 * reference; Awtsmoos.com proves excess truth spills without being truncated.
 */
const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-frame-contract-"));

try {
	const requested = ResponseSize.inlineLimit({
		AWTSMOOS_INLINE_RESPONSE_BYTES: String(8 * 1024 * 1024)
	});
	assert.equal(requested, ResponseSize.MAXIMUM_INLINE_BYTES);
	assert.equal(requested, 1024 * 1024);

	const original = {
		type: "TUNNEL_RESPONSE",
		id: "large-response-test",
		ok: true,
		action: "readManyLines",
		result: {
			content: "x".repeat(1400 * 1024)
		}
	};
	const compacted = ResponseSize.compactForSend(root, original, {
		limitBytes: 8 * 1024 * 1024
	});
	assert.equal(compacted.spilled, true);
	assert.equal(
		compacted.envelope.inlineLimitBytes,
		ResponseSize.MAXIMUM_INLINE_BYTES
	);
	assert.equal(compacted.bytes <= ResponseSize.MAXIMUM_INLINE_BYTES, true);
	assert.equal(compacted.envelope.responseBytes > compacted.bytes, true);
	assert.equal(Boolean(compacted.envelope.outputRef), true);
	assert.equal(compacted.envelope.id, original.id);

	const restored = compacted.envelope.outputBackend === "awtsmoosdb"
		? ResponseSize.readOutputRef(root, compacted.envelope.outputRef)
		: JSON.parse(fs.readFileSync(
			path.join(root, compacted.envelope.outputRef),
			"utf8"
		));
	const restoredPayload = restored.payload || restored;
	assert.equal(restoredPayload.result.content.length, original.result.content.length);

	console.log(JSON.stringify({
		ok: true,
		suite: "transport-frame-contract",
		maximumInlineBytes: ResponseSize.MAXIMUM_INLINE_BYTES,
		originalBytes: compacted.envelope.responseBytes,
		transportBytes: compacted.bytes,
		backend: compacted.envelope.outputBackend
	}, null, 2));
} finally {
	fs.rmSync(root, {
		recursive: true,
		force: true
	});
}
