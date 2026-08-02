// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createMinimalMeadowRuntime.js
 * @description Builds visible fallback play, then starts folded essential gameplay after one bounded paint gate.
 * The Awtsmoos reveals ground and traveler before each fuller garment enters sight;
 * Awtsmoos.com keeps combat, stores, quests, recovery, and streaming inside the tested compact light.
 */

import { createMinimalMeadowRuntimeCore } from './MinimalMeadowRuntimeCore.js';
import {
	scheduleMinimalMeadowFeatures
} from './MinimalMeadowFeatureScheduler.js';
import { markRuntimeStarting } from './RuntimeStateMarker.js';

const FIRST_PAINT_FALLBACK_MS = 120;

/**
 * Creates the visible runtime and starts its statically folded essential feature scheduler.
 *
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
 *
 * @param {object} runtime Minimal runtime instance.
 * @param {object} environment Browser-like environment.
 * @returns {Promise<object>} Feature scheduler receipt.
 */
async function scheduleEssentialFeatures(runtime, environment) {
	await firstVisibleOpportunity(environment);
	return scheduleMinimalMeadowFeatures(runtime, environment, {
		firstPaintAlreadyObserved: true
	});
}

/**
 * Resolves on the first animation frame or a deterministic fallback timer.
 *
 * @param {object} environment Browser-like environment.
 * @returns {Promise<void>} Completion promise for the first visible opportunity.
 */
function firstVisibleOpportunity(environment) {
	return new Promise(resolve => {
		let settled = false;
		let timerId = null;
		const setTimer = environment.setTimeout?.bind(environment) || setTimeout;
		const clearTimer = environment.clearTimeout?.bind(environment) || clearTimeout;
		const finish = () => {
			if (settled) return;
			settled = true;
			if (timerId !== null) clearTimer(timerId);
			resolve();
		};
		timerId = setTimer(finish, FIRST_PAINT_FALLBACK_MS);
		if (typeof environment.requestAnimationFrame === 'function') {
			environment.requestAnimationFrame(finish);
			return;
		}
		setTimer(finish, 0);
	});
}
