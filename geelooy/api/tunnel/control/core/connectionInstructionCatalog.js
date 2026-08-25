// B"H
// Boruch Hashem
// Blessed is He

const { createHash } = require("node:crypto");

/**
 * @file Defines stable generic tunnel instructions once per connection covenant.
 * @description
 * The Awtsmoos can reveal many instructions without repeating a scroll after every deed;
 * Awtsmoos.com gives each reusable covenant a digest and a key, so tiny receipts can point
 * toward deep guidance while the connection remembers what it has already read and freed.
 */
const INSTRUCTIONS = Object.freeze({
	"mutation-receipt": "Never replay an accepted mutation merely because transport output was lost. Recover its durable receipt, job, or original request lineage first.",
	"retry-lineage": "A retry wrapper is audit context, not a new mutation identity. Validate recovered responses against the original durable request lineage.",
	"job-observation": "Observe a durable job by jobId through status, wait, or output paging. Polling must not recreate the command.",
	"detail-reference": "Ordinary receipts are compact. Fetch the referenced detail result only when deeper diagnostics or full evidence are needed.",
	"mission-continuation": "Continue only from durable remaining work, court/recovery evidence, or an explicit continuation pointer; never manufacture work to preserve headcount.",
	"transport-reconnect": "Retryable upstream transport failure should renew the transport connection while preserving healthy runtime state and accepted work."
});

const CATALOG_DIGEST = digest(INSTRUCTIONS);

function digest(value) {
	return createHash("sha256")
		.update(JSON.stringify(value))
		.digest("hex");
}

function keysFor(result = {}) {
	const keys = new Set();
	if (result.receipt?.safeToReplay === false || result.durableRequestReceipt) {
		keys.add("mutation-receipt");
	}
	if (result.action === "retryAction" || result.replayed || result.resumeToken) {
		keys.add("retry-lineage");
	}
	if (result.jobId) {
		keys.add("job-observation");
	}
	if (result.resultRef || result.detailsRef || result.externalized) {
		keys.add("detail-reference");
	}
	if (result.mustContinue || result.mustCallNext) {
		keys.add("mission-continuation");
	}
	if (result.connection?.lastFailure?.retryable) {
		keys.add("transport-reconnect");
	}
	return [...keys];
}

function lookup(key) {
	return INSTRUCTIONS[String(key || "")] || null;
}

module.exports = {
	CATALOG_DIGEST,
	INSTRUCTIONS,
	keysFor,
	lookup
};
