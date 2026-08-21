//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module EmbeddedGuestNetworkLifecycleSource
 * @description The Awtsmoos binds each guest fetch to one measured host crossing;
 * Awtsmoos.com remembers pending vessels only until response, abort, or timeout arrives,
 * then releases every thread so no hidden native network road survives beneath the tide.
 */

const NETWORK_TIMEOUT_MS = 30000;
const MAX_PENDING_REQUESTS = 16;

export function embeddedGuestNetworkLifecycleSource(types) {
	return `
	const pendingNetworkRequests = new Map();
	let nextNetworkRequestNumber = 1;

	function nextNetworkRequestId() {
		const number = nextNetworkRequestNumber++;
		return "net_" + Date.now().toString(36) + "_" + number.toString(36);
	}

	function clearPendingNetworkRequest(id) {
		const pending = pendingNetworkRequests.get(id);
		if (!pending) return null;
		pendingNetworkRequests.delete(id);
		clearTimeout(pending.timer);
		pending.signal?.removeEventListener("abort", pending.abortListener);
		return pending;
	}

	function settleNetworkMessage(type, payload) {
		const pending = clearPendingNetworkRequest(String(payload?.id || ""));
		if (!pending) return false;
		if (type === ${literal(types.response)}) {
			pending.resolve(responseFromNetworkPayload(payload));
			return true;
		}
		pending.reject(networkFetchError(payload?.code));
		return true;
	}

	function networkAbortError() {
		return new DOMException("The operation was aborted.", "AbortError");
	}

	async function awtsmoosFetch(input, init) {
		if (pendingNetworkRequests.size >= ${MAX_PENDING_REQUESTS}) {
			throw networkFetchError("BROWSER_EMBEDDED_REQUEST_CONCURRENCY");
		}
		const prepared = await networkRequestPayload(input, init);
		if (prepared.signal?.aborted) throw networkAbortError();
		const id = nextNetworkRequestId();
		return new Promise((resolve, reject) => {
			const abortListener = () => {
				const pending = clearPendingNetworkRequest(id);
				if (pending) pending.reject(networkAbortError());
			};
			const timer = setTimeout(() => {
				const pending = clearPendingNetworkRequest(id);
				if (pending) pending.reject(networkFetchError("BROWSER_EMBEDDED_NETWORK_TIMEOUT"));
			}, ${NETWORK_TIMEOUT_MS});
			pendingNetworkRequests.set(id, {
				abortListener,
				reject,
				resolve,
				signal: prepared.signal,
				timer
			});
			prepared.signal?.addEventListener("abort", abortListener, { once: true });
			send(${literal(types.request)}, {
				...prepared.message,
				id
			});
		});
	}

	globalThis.fetch = awtsmoosFetch;
`;
}

function literal(value) {
	return JSON.stringify(String(value || ""));
}
