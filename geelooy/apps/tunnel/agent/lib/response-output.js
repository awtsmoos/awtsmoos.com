// B"H
// Boruch Hashem
// Blessed is He

const { withDb } = require("../tools/fs/awdb/open.js");
const Collections = require("../tools/fs/awdb/collections.js");
const Values = require("./response-values.js");

/**
 * B"H
 *
 * A spilled result returns through deliberate pages, not another giant frame.
 * The Awtsmoos renews reference and slice; Awtsmoos.com exposes bounded text
 * while keeping the complete payload in the durable response collection.
 */
function readOutputRef(root, reference) {
	const id = String(reference || "")
		.replace(/^awdb:\/\//, "")
		.split(":")[0];
	return withDb({ root, repoRoot: process.cwd() }, "responses", database => (
		Collections.plain(
			Collections.ensure(database.root, "largeResponses")[id]
		)
	));
}

function readOutputText(root, reference, maxChars = 12000, offsetChars = 0) {
	const stored = readOutputRef(root, reference);
	if (!stored) {
		throw new Error(`awdb_output_ref_not_found: ${reference}`);
	}
	const text = JSON.stringify(stored.payload, null, 2);
	const offset = Values.clamp(offsetChars, 0, text.length, 0);
	const cap = Values.clamp(maxChars, 0, 1024 * 1024, 12000);
	const end = cap
		? Math.min(text.length, offset + cap)
		: text.length;
	return {
		content: text.slice(offset, end),
		encoding: "utf8",
		truncated: end < text.length,
		offsetChars: offset,
		returnedChars: end - offset,
		totalChars: text.length,
		totalBytes: Buffer.byteLength(text),
		nextOffsetChars: end < text.length ? end : null,
		maxChars: cap,
		outputRef: reference,
		outputBackend: "awtsmoosdb"
	};
}

module.exports = {
	readOutputRef,
	readOutputText
};
