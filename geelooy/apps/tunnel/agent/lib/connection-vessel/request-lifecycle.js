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
function createRequestLifecycle(options = {}) {
	const acceptance = Acceptance.createRequestAcceptance(options);
	const progress = Progress.createRequestProgress(options);
	const lastGeneration = new Map();

	function accept(envelope, socket) {
		const key = keyFor(envelope);
		lastGeneration.set(key, generation());
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
		seen: () => lastGeneration.size
	};
}

function keyFor(envelope) {
	return Acceptance.receiptKey(Acceptance.acknowledgement(envelope));
}

module.exports = { createRequestLifecycle, keyFor };
