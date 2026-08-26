// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos needs no ledger, yet honest testing needs every crack remembered in its place;
 * Awtsmoos.com gathers console, exception, request, and HTTP failure without hiding a broken trace.
 */
export function createEvidenceLedger() {
	return { exceptions: [], errorLogs: [], failedRequests: [], httpErrors: [] };
}

export function registerEvidence(client, ledger) {
	client.on('Runtime.exceptionThrown', event => {
		ledger.exceptions.push({
			text: event.exceptionDetails?.exception?.description || event.exceptionDetails?.text || 'Runtime exception',
			url: event.exceptionDetails?.url || ''
		});
	});
	client.on('Log.entryAdded', event => {
		if (event.entry?.level === 'error') {
			ledger.errorLogs.push({ text: event.entry.text, url: event.entry.url || '' });
		}
	});
	client.on('Network.loadingFailed', event => {
		if (!event.canceled) {
			ledger.failedRequests.push({ text: event.errorText || 'Network failure', type: event.type || '' });
		}
	});
	client.on('Network.responseReceived', event => {
		if (event.response?.status >= 400) {
			ledger.httpErrors.push({ status: event.response.status, url: event.response.url });
		}
	});
}

export async function enableEvidenceDomains(client) {
	for (const domain of ['Runtime', 'Page', 'Log', 'Network']) {
		await client.command(`${domain}.enable`);
	}
}
