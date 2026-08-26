// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LivingLibraryTransport
 * @description
 * The Awtsmoos carries each finite request through one cancellable vessel with its error truth intact;
 * Awtsmoos.com lets the next question replace the last without leaving stale answers stacked.
 */

export class ApiRequestError extends Error {
	constructor(message, { code = 'API_REQUEST_FAILED', status = 0, details = null } = {}) {
		super(message);
		this.name = 'ApiRequestError';
		this.code = code;
		this.status = status;
		this.details = details;
	}
}

function payloadError(payload, response) {
	const error = payload?.error;
	const message = typeof error === 'string'
		? error
		: error?.message || payload?.message || `Request failed (${response.status}).`;
	return new ApiRequestError(message, {
		code: error?.code || payload?.code || 'API_REQUEST_FAILED',
		status: response.status,
		details: error?.details || payload?.details || null
	});
}

function relayAbort(externalSignal, controller) {
	if (!externalSignal) return () => {};
	const abort = () => controller.abort('superseded');
	if (externalSignal.aborted) abort();
	else externalSignal.addEventListener('abort', abort, { once: true });
	return () => externalSignal.removeEventListener('abort', abort);
}

export async function requestJson(url, { timeoutMs = 20000, signal } = {}) {
	const controller = new AbortController();
	const releaseAbort = relayAbort(signal, controller);
	const timeout = setTimeout(() => controller.abort('timeout'), timeoutMs);
	try {
		const response = await fetch(url, {
			credentials: 'same-origin',
			headers: { accept: 'application/json' },
			signal: controller.signal
		});
		const text = await response.text();
		let payload;
		try {
			payload = text ? JSON.parse(text) : {};
		} catch {
			throw new ApiRequestError(`Server returned unreadable data (${response.status}).`, { status: response.status });
		}
		if (!response.ok || payload?.error) throw payloadError(payload, response);
		return payload;
	} catch (error) {
		if (error instanceof ApiRequestError) throw error;
		if (controller.signal.aborted) {
			const timedOut = controller.signal.reason === 'timeout';
			throw new ApiRequestError(timedOut ? 'Search took too long. Please try again.' : 'Search was replaced by a newer request.', {
				code: timedOut ? 'REQUEST_TIMEOUT' : 'REQUEST_ABORTED'
			});
		}
		throw new ApiRequestError('Could not reach the library service.', { code: 'NETWORK_ERROR' });
	} finally {
		clearTimeout(timeout);
		releaseAbort();
	}
}
