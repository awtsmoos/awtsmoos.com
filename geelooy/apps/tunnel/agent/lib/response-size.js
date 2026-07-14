// B"H
// Boruch Hashem
// Blessed is He

const Output = require("./response-output.js");
const Spill = require("./response-spill.js");
const Values = require("./response-values.js");

const DEFAULT_INLINE_BYTES = 384 * 1024;
const MAXIMUM_INLINE_BYTES = 1024 * 1024;

/**
 * B"H
 *
 * Complete truth need not cross one fragile frame. The Awtsmoos renews result
 * and reference; Awtsmoos.com keeps every inline response below one mebibyte
 * while preserving larger payloads for bounded, deliberate retrieval.
 */
function inlineLimit(environment = process.env) {
	return Values.clamp(
		environment.AWTSMOOS_INLINE_RESPONSE_BYTES,
		64 * 1024,
		MAXIMUM_INLINE_BYTES,
		DEFAULT_INLINE_BYTES
	);
}

function compactForSend(root, envelope, options = {}) {
	const limit = Values.clamp(
		options.limitBytes ?? inlineLimit(),
		16 * 1024,
		MAXIMUM_INLINE_BYTES,
		inlineLimit()
	);
	const bytes = Values.jsonBytes(envelope);
	if (bytes <= limit) {
		return {
			envelope,
			bytes,
			spilled: false
		};
	}

	const saved = Spill.spill(
		root,
		envelope,
		envelope.action || envelope.type || "response"
	);
	const compact = {
		type: envelope.type || "TUNNEL_RESPONSE",
		id: envelope.id,
		ok: envelope.ok !== false,
		action: envelope.action,
		partial: true,
		responseTruncated: true,
		responseBytes: bytes,
		inlineLimitBytes: limit,
		outputRef: saved.ref,
		outputBackend: saved.backend,
		outputBytes: saved.bytes,
		awdbFile: saved.awdbFile,
		preview: saved.preview,
		warning: saved.warning,
		guidance: saved.backend === "awtsmoosdb"
			? "Response was saved in AwtsmoosDB. Use readOutputText with outputRef."
			: "Response was saved as an .awtsmoos file. Use read/read64 on outputRef."
	};
	return {
		envelope: compact,
		bytes: Values.jsonBytes(compact),
		spilled: true
	};
}

module.exports = {
	MAXIMUM_INLINE_BYTES,
	compactForSend,
	inlineLimit,
	jsonBytes: Values.jsonBytes,
	prune: Spill.prune,
	readOutputRef: Output.readOutputRef,
	readOutputText: Output.readOutputText,
	spill: Spill.spill
};
