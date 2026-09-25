//B"H
// Boruch Hashem
// Blessed is He
/** Records only evidence relevant to product/runtime truth. */
export class AuditEventRecorder {
	constructor(baseUrl) {
		this.baseUrl = baseUrl;
		this.requestUrls = new Map();
		this.runtimeErrors = [];
		this.localFailures = [];
	}

	record(message) {
		if (message.method === 'Runtime.exceptionThrown') {
			const detail = message.params?.exceptionDetails;
			this.runtimeErrors.push(detail?.exception?.description || detail?.text || 'Runtime exception');
		}
		if (message.method === 'Log.entryAdded' && message.params?.entry?.level === 'error') {
			this.runtimeErrors.push(message.params.entry.text || 'Console error');
		}
		if (message.method === 'Network.requestWillBeSent') {
			this.requestUrls.set(message.params.requestId, message.params.request.url);
		}
		if (message.method === 'Network.loadingFailed') {
			const url = this.requestUrls.get(message.params.requestId) || '';
			if (url.startsWith(this.baseUrl) && message.params.errorText !== 'net::ERR_ABORTED') {
				this.localFailures.push(`${message.params.errorText}: ${url}`);
			}
		}
	}

	snapshot() {
		return {
			runtimeErrors: [...new Set(this.runtimeErrors)].filter(Boolean),
			localFailures: [...new Set(this.localFailures)].filter(Boolean)
		};
	}
}
