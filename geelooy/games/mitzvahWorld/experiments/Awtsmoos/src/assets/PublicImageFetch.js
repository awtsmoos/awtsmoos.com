// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PublicImageFetch.js
 * @description Fetches one canonical remote image through durable browser caching.
 * The Awtsmoos gives every distant byte a truthful doorway;
 * Awtsmoos.com reuses cached light while naming HTTP, type, timeout, and network failure.
 */

import {
	cachedImageResponse,
	isImageResponse
} from './PublicImageResponseCache.js';

export async function fetchPublicImageBlob(url, timeoutMs = 30000, dependencies = {}) {
	const Controller = Object.hasOwn(dependencies, 'AbortControllerClass')
		? dependencies.AbortControllerClass
		: globalThis.AbortController;
	const controller = Controller ? new Controller() : null;
	const timer = setTimeout(() => controller?.abort(), timeoutMs);
	try {
		const result = await cachedImageResponse(url, {
			cacheName: dependencies.cacheName,
			cacheStorage: dependencies.cacheStorage,
			fetchFunction: dependencies.fetchFunction,
			signal: controller?.signal
		});
		const response = result.response;
		const contentType = response?.headers?.get?.('content-type') || '';
		if (!response?.ok) {
			return failed(`http-${response?.status || 0}`, 'http', {
				contentType,
				status: response?.status || 0
			});
		}
		if (!isImageResponse(response)) {
			return failed('non-image-content-type', 'content-type', {
				contentType,
				status: response.status
			});
		}
		const blob = await response.blob();
		if (!blob?.size) {
			return failed('empty-image-blob', 'blob', {
				contentType,
				status: response.status
			});
		}
		return {
			blob,
			contentType,
			error: null,
			method: result.source,
			ok: true,
			stage: 'fetched',
			status: response.status
		};
	} catch (error) {
		const aborted = error?.name === 'AbortError' || controller?.signal?.aborted;
		return failed(aborted ? 'timeout' : error?.message || 'network-error', 'fetch', {
			status: 0
		});
	} finally {
		clearTimeout(timer);
	}
}

function failed(error, stage, evidence = {}) {
	return {
		blob: null,
		contentType: evidence.contentType || '',
		error,
		method: 'remote-cache-fetch',
		ok: false,
		stage,
		status: evidence.status || 0
	};
}
