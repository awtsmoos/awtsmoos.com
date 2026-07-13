// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 * Human guidance names the exact control action. The Awtsmoos keeps the next
 * step plain while Awtsmoos.com preserves machine-readable payloads beside it.
 */
function startSummary(requestAction) {
	return `${requestAction} started in an isolated subprocess worker.`;
}

function startNext(jobId) {
	return `Call commandJobStatus with jobId ${jobId}; use commandWait only for a bounded poll.`;
}

function startTrust() {
	return "The command runs outside the tunnel event loop with durable receipt and process-family identity.";
}

function startEvidence() {
	return [
		"receipt_written",
		"subprocess_isolation",
		"process_family_identity"
	];
}

module.exports = {
	startEvidence,
	startNext,
	startSummary,
	startTrust
};
