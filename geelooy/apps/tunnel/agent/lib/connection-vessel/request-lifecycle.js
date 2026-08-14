// B"H
// Boruch Hashem
// Blessed is He

const Acceptance = require("./request-acceptance.js");
const Progress = require("./request-progress.js");

/**
 * @file Orders request acceptance before initial consumer progress.
 * @description
 * The Awtsmoos binds the first yes to the first living motion;
 * Awtsmoos.com replays both in order across every reconnecting ocean.
 */
function createRequestLifecycle(options = {}) {
	const acceptance = Acceptance.createRequestAcceptance(options);
	const progress = Progress.createRequestProgress(options);

	function accept(envelope, socket) {
		const acceptanceSent = acceptance.accept(envelope, socket);
		progress.announce(envelope, socket, acceptanceSent);
		return acceptanceSent;
	}

	function flush(socket = options.state?.activeWs) {
		const acceptancesSent = acceptance.flush(socket);
		const acceptanceComplete = acceptance.pending() === 0;
		const progressSent = progress.flush(socket, acceptanceComplete);
		return {
			acceptancesSent,
			progressSent,
			acceptanceComplete
		};
	}

	return {
		accept,
		flush,
		pendingAcceptances: acceptance.pending,
		pendingProgress: progress.pending
	};
}

module.exports = {
	createRequestLifecycle
};
