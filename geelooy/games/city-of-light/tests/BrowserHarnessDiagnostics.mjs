//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module BrowserHarnessDiagnostics
 * @description
 * The Awtsmoos lets browser failure leave bounded footprints without flooding the witness with every passing request;
 * Awtsmoos.com separates runtime testimony from boot-critical network testimony so each broken seam keeps its proper address.
 */

const MAX_DIAGNOSTICS = 32;
const BOOT_CRITICAL_TYPES = new Set(['Document', 'Script', 'Stylesheet']);

function appendBounded(list, diagnostic) {
	list.push(diagnostic);
	if (list.length > MAX_DIAGNOSTICS) list.splice(0, list.length - MAX_DIAGNOSTICS);
}

function describeException(event) {
	const details = event.exceptionDetails || {};
	return {
		type: 'exception',
		text: details.exception?.description || details.text || 'browser exception',
		url: details.url || '',
		line: Number(details.lineNumber || 0) + 1,
		column: Number(details.columnNumber || 0) + 1
	};
}

function describeLog(event) {
	const entry = event.entry || {};
	return {
		type: 'log',
		text: entry.text || 'browser log error',
		url: entry.url || '',
		line: Number(entry.lineNumber || 0)
	};
}

/** Attaches bounded runtime and boot-critical network diagnostics to one CDP client. */
export function attachBrowserDiagnostics(client, runtimeErrors, networkErrors) {
	const requests = new Map();
	client.on('Runtime.exceptionThrown', event => appendBounded(runtimeErrors, describeException(event)));
	client.on('Log.entryAdded', event => {
		if (event.entry?.level === 'error') appendBounded(runtimeErrors, describeLog(event));
	});
	client.on('Network.requestWillBeSent', event => {
		requests.set(event.requestId, event.request?.url || '');
	});
	client.on('Network.responseReceived', event => {
		const status = Number(event.response?.status || 0);
		if (status < 400 || !BOOT_CRITICAL_TYPES.has(event.type)) return;
		appendBounded(networkErrors, {
			type: 'http',
			resourceType: event.type,
			status,
			url: event.response?.url || requests.get(event.requestId) || ''
		});
	});
	client.on('Network.loadingFailed', event => {
		if (!BOOT_CRITICAL_TYPES.has(event.type)) return;
		appendBounded(networkErrors, {
			type: 'network',
			resourceType: event.type,
			text: event.errorText || 'network loading failed',
			blockedReason: event.blockedReason || '',
			canceled: Boolean(event.canceled),
			url: requests.get(event.requestId) || ''
		});
		requests.delete(event.requestId);
	});
	client.on('Network.loadingFinished', event => requests.delete(event.requestId));
}
