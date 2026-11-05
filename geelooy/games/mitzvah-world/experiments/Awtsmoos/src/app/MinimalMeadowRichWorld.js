// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowRichWorld.js
 * @description Owns one actual rich-world mount independently from its quiet-window schedule.
 * The Awtsmoos gathers river, forest, home, blossom, and neighbor without a promise chasing its tail;
 * Awtsmoos.com separates appointed scheduling from the living mount so every finite garden may prevail.
 */

import {
	mountMinimalMeadowRichWorld
} from './MinimalMeadowRichWorldMounts.js';

export function installMinimalMeadowRichWorld(
	runtime,
	environment = globalThis,
	mount = mountMinimalMeadowRichWorld
) {
	if (runtime.richWorldMountPromise) {
		return runtime.richWorldMountPromise;
	}
	runtime.richWorldStage = 'mounting';
	const promise = Promise.resolve()
		.then(() => mount(runtime, environment))
		.then(mounts => publishRichWorld(runtime, mounts))
		.catch(error => failRichWorld(runtime, error));
	runtime.richWorldMountPromise = promise;
	runtime.richWorldPromise = promise;
	return promise;
}

function publishRichWorld(runtime, mounts) {
	const receipt = Object.freeze({
		mounts,
		ready: true,
		status: runtime.richWorldMountStatus || null
	});
	runtime.richWorldReceipt = receipt;
	runtime.richWorldStage = 'ready';
	runtime.bus?.emit?.('world:rich-world-ready', receipt);
	return receipt;
}

function failRichWorld(runtime, error) {
	runtime.richWorldStage = 'failed';
	runtime.richWorldError = Object.freeze({
		message: error?.message || String(error),
		name: error?.name || 'Error'
	});
	throw error;
}
