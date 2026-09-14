//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file CdpProofEvidence.mjs
 * @description Owns browser failure evidence collection for real MitzvahWorld release proofs.
 * Protocol transport remains separate so error testimony can evolve without changing command timing or target ownership.
 */

/**
 * Creates the browser evidence arrays consumed by desktop, traversal, and mobile proofs.
 * @returns {{consoleErrors: string[], loadingFailures: object[], networkErrors: object[], runtimeExceptions: string[]}} Empty evidence ledger.
 */
export function createCdpProofEvidence() {
	return {
		consoleErrors: [],
		loadingFailures: [],
		networkErrors: [],
		runtimeExceptions: []
	};
}

/**
 * Records one DevTools event when it represents a release-invalidating browser failure.
 * @param {object} message Parsed Chrome DevTools protocol message.
 * @param {object} evidence Mutable evidence ledger owned by one proof session.
 * @returns {void}
 */
export function recordCdpProofEvidence(message, evidence) {
	if (message.method === 'Network.responseReceived') {
		const response = message.params.response;
		if (response.status >= 400) {
			evidence.networkErrors.push({
				status: response.status,
				url: response.url
			});
		}
	}

	if (message.method === 'Network.loadingFailed' && !message.params.canceled) {
		evidence.loadingFailures.push({
			errorText: message.params.errorText,
			type: message.params.type
		});
	}

	if (message.method === 'Runtime.exceptionThrown') {
		const details = message.params.exceptionDetails;
		evidence.runtimeExceptions.push(
			details.exception?.description
				|| details.text
				|| 'Runtime exception'
		);
	}

	if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') {
		evidence.consoleErrors.push(
			consoleMessage(message.params.args)
		);
	}

	if (message.method === 'Log.entryAdded' && message.params.entry?.level === 'error') {
		evidence.consoleErrors.push(
			message.params.entry.text || 'Browser log error'
		);
	}
}

/**
 * Converts Chrome remote objects into one bounded diagnostic sentence.
 * @param {object[]} args Console remote-object arguments.
 * @returns {string} Human-readable console evidence.
 */
function consoleMessage(args = []) {
	return args.map(argument => {
		return String(
			argument.value
				?? argument.description
				?? argument.type
				?? 'unknown'
		);
	}).join(' ');
}
