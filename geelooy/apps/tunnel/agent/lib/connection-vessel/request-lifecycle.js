// B"H
// Boruch Hashem
// Blessed is He

const Acceptance = require("./request-acceptance.js");
const Progress = require("./request-progress.js");

/**
 * @file Restates durable request custody once per socket generation.
 * @description
 * The Awtsmoos binds one request identity to the generation that last testified.
 * Same-socket flushes remain silent, while a reconnect may re-speak acceptance and
 * first progress once from disk—without dispatching a second command.
 */
/**
 * Upper bound for the same-generation duplicate-suppression memory.
 * The map exists so recover() can stay silent for requests already restated in
 * the current generation; only recent keys matter, so the oldest entries are
 * evicted FIFO. A long-lived child can no longer grow this map without limit.
 */
const LAST_GENERATION_LIMIT = 8192;

function createRequestLifecycle(options = {}) {
	const acceptance = Acceptance.createRequestAcceptance(options);
	const progress = Progress.createRequestProgress(options);
	const lastGeneration = new Map();

	function accept(envelope, socket) {
		const key = keyFor(envelope);
		// Falsy keys are never looked up by recover(); storing them is pure
		// waste, so they are skipped instead of occupying bounded memory.
		if (key) {
			if (!lastGeneration.has(key) && lastGeneration.size >= LAST_GENERATION_LIMIT) {
				const oldest = lastGeneration.keys().next();
				if (!oldest.done) lastGeneration.delete(oldest.value);
			}
			lastGeneration.set(key, generation());
		}
		const acceptanceSent = acceptance.accept(envelope, socket);
		progress.announce(envelope, socket, acceptanceSent);
		return acceptanceSent;
	}

	function recover(envelopes = [], socket = options.state?.activeWs) {
		const currentGeneration = generation();
		let recovered = 0;
		for (const envelope of envelopes) {
			const key = keyFor(envelope);
			if (!key || lastGeneration.get(key) === currentGeneration) continue;
			accept(envelope, socket);
			recovered += 1;
		}
		return recovered;
	}

	function flush(socket = options.state?.activeWs) {
		const acceptancesSent = acceptance.flush(socket);
		const acceptanceComplete = acceptance.pending() === 0;
		const progressSent = progress.flush(socket, acceptanceComplete);
		return { acceptancesSent, progressSent, acceptanceComplete };
	}

	function generation() {
		return Number(options.state?.generation || 0);
	}

	return {
		accept,
		flush,
		pendingAcceptances: acceptance.pending,
		pendingProgress: progress.pending,
		recover,
		seen: () => lastGeneration.size,
		lastGenerationLimit: () => LAST_GENERATION_LIMIT
	};
}

function keyFor(envelope) {
	return Acceptance.receiptKey(Acceptance.acknowledgement(envelope));
}

module.exports = { createRequestLifecycle, keyFor };
