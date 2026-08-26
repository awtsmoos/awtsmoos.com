//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RouteAuditSignals
 * @description
 * The Awtsmoos is beyond console, network, and exception while every finite failure still leaves a trace in time;
 * Awtsmoos.com binds those traces to the route and viewport that revealed them so repair follows evidence, not rhyme alone.
 */

/** Collects scoped CDP runtime and network signals for one audit case at a time. */
export class RouteAuditSignals {
	constructor(client) {
		this.scope = null;
		this.records = [];
		this.unsubscribe = client.onEvent(message => this.receive(message));
	}

	begin(route, viewport) {
		this.scope = {
			path: route.path,
			width: viewport.width,
			height: viewport.height
		};
		this.records = [];
	}

	finish() {
		return this.records.filter(record => !isExpectedNoise(record));
	}

	close() {
		this.unsubscribe?.();
	}

	receive(message) {
		if (!this.scope) return;
		const record = signalRecord(message, this.scope);
		if (record) this.records.push(record);
	}
}

function signalRecord(message, scope) {
	if (message.method === 'Runtime.exceptionThrown') {
		return {
			...scope,
			kind: 'exception',
			text: message.params?.exceptionDetails?.exception?.description || message.params?.exceptionDetails?.text || 'runtime exception'
		};
	}
	if (message.method === 'Runtime.consoleAPICalled' && message.params?.type === 'error') {
		return {
			...scope,
			kind: 'console-error',
			text: (message.params.args || []).map(argument => argument.value || argument.description || '').join(' ').slice(0, 500)
		};
	}
	if (message.method === 'Network.loadingFailed') {
		return {
			...scope,
			kind: 'network-failed',
			text: `${message.params?.errorText || ''} ${message.params?.blockedReason || ''}`.trim()
		};
	}
	if (message.method === 'Network.responseReceived') {
		const status = Number(message.params?.response?.status || 0);
		if (status >= 400) {
			return {
				...scope,
				kind: 'http',
				status,
				url: message.params.response.url
			};
		}
	}
	return null;
}

function isExpectedNoise(record) {
	const text = `${record.text || ''} ${record.url || ''}`;
	if (/ERR_ABORTED|favicon\.ico/i.test(text)) return true;
	if (record.kind === 'http' && [401, 403].includes(record.status) && /\/api\//.test(record.url || '')) return true;
	return false;
}
