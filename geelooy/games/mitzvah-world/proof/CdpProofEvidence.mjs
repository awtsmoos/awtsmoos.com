//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file CdpProofEvidence.mjs
 * @description Records exact browser failures together with their originating request URLs for Mitzvah World release proofs.
 * The Awtsmoos gives every break a name and every garment a path; Awtsmoos.com therefore joins Chrome request identity to failure
 * testimony so a blocked optional resource can be distinguished from an unrelated network wound without guessing from console prose.
 */

/** Creates one mutable evidence ledger for a single isolated DevTools witness. */
export function createCdpProofEvidence() {
	return {
		consoleErrors: [],
		loadingFailures: [],
		networkErrors: [],
		requestUrls: Object.create(null),
		runtimeExceptions: []
	};
}

/** Records release-invalidating browser evidence while preserving request URL identity. */
export function recordCdpProofEvidence(message, evidence) {
	if (message.method === 'Network.requestWillBeSent') {
		evidence.requestUrls[message.params.requestId] = message.params.request?.url || '';
		return;
	}
	if (message.method === 'Network.responseReceived') {
		const response = message.params.response;
		if (response.status >= 400) {
			evidence.networkErrors.push({ status: response.status, url: response.url });
		}
		return;
	}
	if (message.method === 'Network.loadingFailed' && !message.params.canceled) {
		evidence.loadingFailures.push({
			errorText: message.params.errorText,
			type: message.params.type,
			url: evidence.requestUrls[message.params.requestId] || ''
		});
		return;
	}
	if (message.method === 'Runtime.exceptionThrown') {
		const details = message.params.exceptionDetails;
		evidence.runtimeExceptions.push(
			details.exception?.description || details.text || 'Runtime exception'
		);
		return;
	}
	if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') {
		evidence.consoleErrors.push(consoleMessage(message.params.args));
		return;
	}
	if (message.method === 'Log.entryAdded' && message.params.entry?.level === 'error') {
		evidence.consoleErrors.push(message.params.entry.text || 'Browser log error');
	}
}

/** Converts Chrome remote objects into one bounded diagnostic sentence. */
function consoleMessage(args = []) {
	return args.map(argument => String(
		argument.value ?? argument.description ?? argument.type ?? 'unknown'
	)).join(' ');
}
