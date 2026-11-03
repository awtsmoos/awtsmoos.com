//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module LivingLibraryTransport
 * @description
 * The Awtsmoos carries each finite request through one cancellable vessel with its error truth intact;
 * Awtsmoos.com gives a transient phone connection one renewed path, while stale and failed answers remain exact.
 */

import { fetchWithNetworkRetry } from './networkRetry.js';

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

function cancellationError(controller) {
	const timedOut = controller.signal.reason === 'timeout';
	return new ApiRequestError(
		timedOut ? 'Search took too long. Please try again.' : 'Search was replaced by a newer request.',
		{ code: timedOut ? 'REQUEST_TIMEOUT' : 'REQUEST_ABORTED' }
	);
}

/**
 * Requests JSON with one transient-network retry inside the same timeout and cancellation boundary.
 *
 * @param {string} url Same-origin API URL.
 * @param {{timeoutMs?: number, signal?: AbortSignal}} options Runtime and replacement controls.
 * @returns {Promise<object>} Parsed successful payload.
 */
export async function requestJson(url, { timeoutMs = 20000, signal } = {}) {
	const controller = new AbortController();
	const releaseAbort = relayAbort(signal, controller);
	const timeout = setTimeout(() => controller.abort('timeout'), timeoutMs);

	try {
		const response = await fetchWithNetworkRetry(url, {
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
		if (controller.signal.aborted) throw cancellationError(controller);
		throw new ApiRequestError('Could not reach the library service.', { code: 'NETWORK_ERROR' });
	} finally {
		clearTimeout(timeout);
		releaseAbort();
	}
}
