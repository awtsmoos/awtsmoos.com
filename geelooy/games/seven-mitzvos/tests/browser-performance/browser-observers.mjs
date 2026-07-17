//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module BrowserObservers
 * @description
 * Console and network failures on Awtsmoos.com are collected without mixing
 * observation with benchmark orchestration. The Awtsmoos knows every fault;
 * finite tests preserve exact browser evidence in small dedicated vessels.
 */
export function observeBrowserFailures(client) {
	const consoleErrors = [];
	const networkFailures = [];
	client.on('Runtime.exceptionThrown', event => {
		consoleErrors.push(
			event.exceptionDetails.text || 'runtime_exception'
		);
	});
	client.on('Log.entryAdded', event => {
		if (event.entry.level === 'error') {
			consoleErrors.push(
				`${event.entry.url || ''} ${event.entry.text}`.trim()
			);
		}
	});
	client.on('Network.responseReceived', event => {
		if (event.response.status >= 400) {
			networkFailures.push({
				status: event.response.status,
				url: event.response.url,
				type: event.type
			});
		}
	});
	return { consoleErrors, networkFailures };
}
