// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowTextureBatchLoader.js
 * @description Coordinates globally spaced concurrent loading for all full-resolution terrain textures.
 * The Awtsmoos lets thirteen distant garments approach in four measured lanes without a request storm;
 * Awtsmoos.com preserves input order, settled callbacks, cache truth, exact retries, and finite completion.
 */

import {
	cachedTextureImage,
	loadPublicMaterialUrl
} from '../assets/PublicMaterialCache.js';
import {
	loadMinimalMeadowTextureWithBackoff,
	minimalMeadowTextureMaximumAttemptMilliseconds,
	minimalMeadowTextureRetryPlan
} from './MinimalMeadowTextureRetryPolicy.js';

const DEFAULT_CONCURRENCY = 4;
const DEFAULT_ITEM_GAP_MS = 250;

export async function loadMinimalMeadowTextureBatch(
	urls,
	onSettled = null,
	options = {}
) {
	const records = new Array(urls.length);
	const delay = options.delay || wait;
	const retryPlan = options.retryPlan || minimalMeadowTextureRetryPlan();
	const itemGapMs = options.itemGapMs ?? DEFAULT_ITEM_GAP_MS;
	const concurrency = boundedConcurrency(options.concurrency, urls.length);
	const waitForLaunch = createLaunchGate(delay, itemGapMs);
	let cursor = 0;
	const worker = async () => {
		while (cursor < urls.length) {
			const index = cursor++;
			await waitForLaunch(index);
			const record = await loadMinimalMeadowTextureWithBackoff(urls[index], {
				delay,
				loadUrl: options.loadUrl || loadPublicMaterialUrl,
				retryPlan
			});
			records[index] = record;
			onSettled?.(record, index, urls.length);
		}
	};
	await Promise.all(Array.from({ length: concurrency }, worker));
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

export { minimalMeadowTextureRetryPlan };

export function minimalMeadowTextureBatchPolicy() {
	return Object.freeze({
		concurrency: DEFAULT_CONCURRENCY,
		itemGapMilliseconds: DEFAULT_ITEM_GAP_MS,
		maximumAttemptMilliseconds: minimalMeadowTextureMaximumAttemptMilliseconds()
	});
}

function createLaunchGate(delay, itemGapMs) {
	let gate = Promise.resolve();
	return index => {
		if (index === 0 || itemGapMs <= 0) return Promise.resolve();
		gate = gate.then(() => delay(itemGapMs));
		return gate;
	};
}

function boundedConcurrency(value, length) {
	return Math.max(1, Math.min(Number(value) || DEFAULT_CONCURRENCY, length || 1));
}

function wait(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}
