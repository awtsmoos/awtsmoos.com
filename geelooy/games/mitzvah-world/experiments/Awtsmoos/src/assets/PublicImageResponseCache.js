// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PublicImageResponseCache.js
 * @description Deduplicates verified image fetches while Cache Storage preserves good bytes.
 * The Awtsmoos lets one distant response become enough for every waiting eye;
 * Awtsmoos.com shares one request and gives each consumer an untouched reply.
 */

import {
	publicImageCacheStorage,
	publicImageNetworkRequestOptions
} from './PublicImageFetchDependencies.js';
import {
	activePublicImageCircuit,
	clearPublicImageCircuit,
	publicImageCircuitStats,
	rememberPublicImageCircuit
} from './PublicImageRateLimitCircuit.js';
import { clonePublicImageResponse } from './PublicImageResponseClone.js';
import {
	isRetryableImageStatus,
	retryAfterHeaderMs
} from './PublicImageRetryPolicy.js';

export const PUBLIC_IMAGE_CACHE_NAME = 'awtsmoos-mitzvah-world-remote-images-v1';
const pendingByUrl = new Map();

export async function cachedImageResponse(url, options = {}) {
	const fetchFunction = options.fetchFunction || globalThis.fetch;
	if (typeof fetchFunction !== 'function') {
		throw new Error('Remote image fetch is unavailable.');
	}
	const cache = await openCache(publicImageCacheStorage(options), options.cacheName);
	const cached = await cache?.match?.(url);
	if (cached) return responseRecord(cached, 'cache-storage');
	const circuit = activePublicImageCircuit(url, options);
	if (circuit && options.bypassCircuit !== true) {
		return responseRecord(circuit.response, 'rate-limit-circuit', {
			circuitOpen: true,
			retryAfterMs: circuit.retryAfterMs
		});
	}
	const pending = pendingByUrl.get(url);
	if (pending) return cloneRecord(await pending, 'network-shared');
	const request = fetchAndRemember(url, fetchFunction, cache, options);
	pendingByUrl.set(url, request);
	try {
		return cloneRecord(await request);
	} finally {
		if (pendingByUrl.get(url) === request) pendingByUrl.delete(url);
	}
}

export function isImageResponse(response) {
	const contentType = response?.headers?.get?.('content-type') || '';
	return contentType.toLowerCase().startsWith('image/');
}

export function clearPublicImageResponseState() {
	pendingByUrl.clear();
	clearPublicImageCircuit();
}

export function publicImageResponseStats(options = {}) {
	return {
		circuits: publicImageCircuitStats(options).open,
		pending: pendingByUrl.size
	};
}

async function fetchAndRemember(url, fetchFunction, cache, options) {
	const response = await fetchFunction(url, publicImageNetworkRequestOptions(options));
	if (response?.ok && isImageResponse(response)) {
		clearPublicImageCircuit(url);
		await cache?.put?.(url, clonePublicImageResponse(response));
	} else if (isRetryableImageStatus(response?.status)) {
		rememberPublicImageCircuit(url, response, options);
	}
	return responseRecord(response, 'network', {
		retryAfterMs: retryAfterHeaderMs(response, options) || 0
	});
}

function responseRecord(response, source, evidence = {}) {
	return {
		circuitOpen: Boolean(evidence.circuitOpen),
		response,
		retryAfterMs: Math.max(0, evidence.retryAfterMs || 0),
		source
	};
}

function cloneRecord(record, source = record.source) {
	return {
		...record,
		response: clonePublicImageResponse(record.response),
		source
	};
}

async function openCache(cacheStorage, cacheName = PUBLIC_IMAGE_CACHE_NAME) {
	if (!cacheStorage || typeof cacheStorage.open !== 'function') return null;
	try {
		return await cacheStorage.open(cacheName);
	} catch {
		return null;
	}
}
