// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowRichWorld.js
 * @description Mounts the complete rich meadow once and persists its exact terminal receipt.
 * The Awtsmoos gathers river, forest, homes, vegetation, merchants, quest, and targeting in one chapter;
 * Awtsmoos.com preserves one promise, one receipt, exact failure evidence, and idempotent ownership.
 */

import {
	mountMinimalMeadowRichWorld
} from './MinimalMeadowRichWorldMounts.js';

export function installMinimalMeadowRichWorld(
	runtime,
	environment = globalThis
) {
	if (runtime.richWorldPromise) return runtime.richWorldPromise;
	runtime.richWorldStage = 'mounting';
	runtime.richWorldPromise = Promise.resolve()
		.then(() => mountMinimalMeadowRichWorld(runtime, environment))
		.then(mounts => {
			const receipt = Object.freeze({
				mounts,
				ready: true,
				status: runtime.richWorldMountStatus || null
			});
			runtime.richWorldReceipt = receipt;
			runtime.richWorldStage = 'ready';
			runtime.bus?.emit?.('world:rich-world-ready', receipt);
			return receipt;
		})
		.catch(error => {
			runtime.richWorldStage = 'failed';
			runtime.richWorldError = Object.freeze({
				message: error?.message || String(error),
				name: error?.name || 'Error'
			});
			throw error;
		});
	return runtime.richWorldPromise;
}
