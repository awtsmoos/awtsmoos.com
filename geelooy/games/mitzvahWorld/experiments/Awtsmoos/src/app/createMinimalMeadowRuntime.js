// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createMinimalMeadowRuntime.js
 * @description Builds visible fallback play, then begins essential gameplay after one bounded paint gate.
 * The Awtsmoos reveals ground and traveler before every distant garment; Awtsmoos.com never lets
 * a throttled animation frame imprison combat, stores, quests, recovery, or streaming beyond sight.
 */

import { resolveDeferredAppModuleUrl } from './DeferredAppModuleUrl.js';
import { createMinimalMeadowRuntimeCore } from './MinimalMeadowRuntimeCore.js';
import { markRuntimeStarting } from './RuntimeStateMarker.js';

const FIRST_PAINT_FALLBACK_MS = 120;
const FEATURE_SCHEDULER_URL = resolveDeferredAppModuleUrl(
	'MinimalMeadowFeatureScheduler.js',
	import.meta.url,
	'createMinimalMeadowRuntime.js'
);

/**
 * Creates the minimal visible runtime and schedules essential gameplay after paint.
 * @param {object} hosts Runtime host elements.
 * @param {object} [options] Runtime construction options.
 * @returns {Promise<object>} Runtime diagnostics with a feature-installation promise.
 */
export async function createMinimalMeadowRuntime(hosts, options = {}) {
	const environment = options.environment || globalThis;
	const documentValue = environment.document || globalThis.document;
	markRuntimeStarting(documentValue);
	const diagnostics = await createMinimalMeadowRuntimeCore(hosts, options);
	diagnostics.featuresPromise = scheduleEssentialFeatures(
		diagnostics.runtime,
		environment
	);
	return diagnostics;
}

/**
 * Waits for one bounded visible opportunity before installing essential features.
 * @param {object} runtime Minimal runtime instance.
 * @param {object} environment Browser-like environment.
 * @returns {Promise<object>} Feature scheduler result.
 */
async function scheduleEssentialFeatures(runtime, environment) {
	await firstVisibleOpportunity(environment);
	const module = await import(FEATURE_SCHEDULER_URL);
	return module.scheduleMinimalMeadowFeatures(runtime, environment, {
		firstPaintAlreadyObserved: true
	});
}

/**
 * Resolves on the first animation frame or a deterministic fallback timer.
 * @param {object} environment Browser-like environment.
 * @returns {Promise<void>} Completion promise for the first visible opportunity.
 */
function firstVisibleOpportunity(environment) {
	return new Promise((resolve) => {
		let settled = false;
		const setTimer = environment.setTimeout?.bind(environment) || setTimeout;
		const clearTimer = environment.clearTimeout?.bind(environment) || clearTimeout;
		const finish = () => {
			if (settled) {
				return;
			}
			settled = true;
			clearTimer(timerId);
			resolve();
		};
		const timerId = setTimer(finish, FIRST_PAINT_FALLBACK_MS);
		if (typeof environment.requestAnimationFrame === 'function') {
			environment.requestAnimationFrame(finish);
			return;
		}
		setTimer(finish, 0);
	});
}
