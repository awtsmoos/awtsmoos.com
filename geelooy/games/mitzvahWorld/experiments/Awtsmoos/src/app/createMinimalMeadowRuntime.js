// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createMinimalMeadowRuntime.js
 * @description Builds visible fallback play, then starts folded essential gameplay after one paint gate.
 * The Awtsmoos reveals ground and traveler before each richer garment enters sight;
 * Awtsmoos.com keeps required mechanics inside the tested compact light.
 */

import {
	createMinimalMeadowBootTimeline
} from './MinimalMeadowBootTimeline.js';
import {
	awaitEssentialFeatureReceipt
} from './MinimalMeadowEssentialFeatureGate.js';
import {
	scheduleMinimalMeadowFeatures
} from './MinimalMeadowFeatureScheduler.js';
import { createMinimalMeadowRuntimeCore } from './MinimalMeadowRuntimeCore.js';
import { markRuntimeStarting } from './RuntimeStateMarker.js';

const FIRST_PAINT_FALLBACK_MS = 120;

export async function createMinimalMeadowRuntime(hosts, options = {}) {
	const environment = options.environment || globalThis;
	const documentValue = environment.document || globalThis.document;
	const timeline = createMinimalMeadowBootTimeline(environment);
	timeline.mark('runtime-starting');
	markRuntimeStarting(documentValue);
	timeline.mark('core-create-start');
	const diagnostics = await createMinimalMeadowRuntimeCore(hosts, options);
	const runtime = diagnostics.runtime;
	timeline.mark('core-created');
	runtime.bootTimeline = timeline;
	diagnostics.bootTimeline = timeline;
	const featurePromise = scheduleEssentialFeatures(
		runtime,
		environment,
		timeline
	);
	const guardedPromise = awaitEssentialFeatureReceipt(
		featurePromise,
		runtime,
		environment,
		{
			timeline,
			timeoutMs: options.essentialFeatureTimeoutMs
		}
	);
	runtime.essentialFeaturePromise = guardedPromise;
	diagnostics.featuresPromise = guardedPromise;
	return diagnostics;
}

async function scheduleEssentialFeatures(runtime, environment, timeline) {
	timeline.mark('first-paint-wait');
	await firstVisibleOpportunity(environment);
	timeline.mark('first-paint-observed');
	timeline.mark('essential-schedule-start');
	return scheduleMinimalMeadowFeatures(runtime, environment, { timeline });
}

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
