// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowTextureBatchLoader.js
 * @description Serializes Awtsmoos Drive texture requests with spacing and increasing backoff.
 * The Awtsmoos reveals distant abundance without a request storm; Awtsmoos.com preserves
 * exact status, timeout, delay, retry, cache, and final-failure evidence for every image.
 */

import {
	cachedTextureImage,
	loadPublicMaterialUrl
} from '../assets/PublicMaterialCache.js';

const DEFAULT_ITEM_GAP_MS = 400;
const DEFAULT_RETRY_PLAN = Object.freeze([
	Object.freeze({ delayMs: 0, timeoutMs: 18000 }),
	Object.freeze({ delayMs: 2500, timeoutMs: 32000 }),
	Object.freeze({ delayMs: 10000, timeoutMs: 45000 })
]);

export async function loadMinimalMeadowTextureBatch(
	urls,
	onSettled = null,
	options = {}
) {
	const records = new Array(urls.length);
	const delay = options.delay || wait;
	const loadUrl = options.loadUrl || loadPublicMaterialUrl;
	const retryPlan = options.retryPlan || DEFAULT_RETRY_PLAN;
	const itemGapMs = options.itemGapMs ?? DEFAULT_ITEM_GAP_MS;
	for (let index = 0; index < urls.length; index += 1) {
		if (index > 0 && itemGapMs > 0) await delay(itemGapMs);
		const record = await loadWithBackoff(urls[index], {
			delay,
			loadUrl,
			retryPlan
		});
		records[index] = record;
		onSettled?.(record, index, urls.length);
	}
	return records;
}

export function requireMinimalMeadowTextureImages(entries, records) {
	return Object.fromEntries(entries.map(([role, url]) => {
		const image = cachedTextureImage(url);
		const record = records.find(candidate => {
			return candidate.url === url || candidate.primaryUrl === url;
		});
		if (!image) {
			throw new Error(
				`Terrain image failed after ${record?.batchAttempts?.length || 0} attempts: `
				+ `${url} ${record?.error || 'not cached'}`
			);
		}
		return [role, image];
	}));
}

export function minimalMeadowTextureRetryPlan() {
	return DEFAULT_RETRY_PLAN.map(step => ({ ...step }));
}

async function loadWithBackoff(url, options) {
	const attempts = [];
	let record = failureRecord(url);
	for (let index = 0; index < options.retryPlan.length; index += 1) {
		const step = options.retryPlan[index];
		if (step.delayMs > 0) await options.delay(step.delayMs);
		record = await options.loadUrl(url, step.timeoutMs);
		attempts.push(attemptRecord(record, index, step));
		if (record.ok) break;
	}
	return {
		...record,
		batchAttempts: Object.freeze(attempts),
		retryCount: Math.max(0, attempts.length - 1)
	};
}

function attemptRecord(record, index, step) {
	return Object.freeze({
		attempt: index + 1,
		delayMs: step.delayMs,
		error: record.error || null,
		fromCache: Boolean(record.fromCache),
		ok: Boolean(record.ok),
		status: record.status || 0,
		timeoutMs: step.timeoutMs
	});
}

function failureRecord(url) {
	return { error: 'not-attempted', ok: false, status: 0, url };
}

function wait(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}
