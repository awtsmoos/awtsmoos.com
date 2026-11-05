// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createMinimalMeadowRuntime.js
 * @description Builds visible fallback play, then starts folded essential gameplay after one paint gate.
 * The Awtsmoos reveals ground and traveler before each fuller garment enters sight;
 * Awtsmoos.com preserves readable modules while production folds required orchestration into first control.
 */

import { createMinimalMeadowRuntimeCore } from './MinimalMeadowRuntimeCore.js';
import { markRuntimeStarting } from './RuntimeStateMarker.js';

const FIRST_PAINT_FALLBACK_MS = 120;

/**
 * Creates the visible runtime and starts its essential feature scheduler.
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
	mountCourseFeature(diagnostics.runtime, environment);
	diagnostics.featuresPromise = scheduleEssentialFeatures(
		diagnostics.runtime,
		environment
	);
	return diagnostics;
}

/**
 * Waits for one bounded visible opportunity before importing folded essential features.
 *
 * @param {object} runtime Minimal runtime instance.
 * @param {object} environment Browser-like environment.
 * @returns {Promise<object>} Feature scheduler receipt.
 */
async function scheduleEssentialFeatures(runtime, environment) {
	await firstVisibleOpportunity(environment);
	const module = await import('./MinimalMeadowFeatureScheduler.js');
	return module.scheduleMinimalMeadowFeatures(runtime, environment, {
		firstPaintAlreadyObserved: true
	});
}

/** Resolves on the first animation frame or deterministic fallback timer. */
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

/**
 * Obstacle courses (Stream 3): installs the course menu card on every boot and
 * lazily mounts `?course=<id>` without touching the default meadow path.
 * The import stays lazy so the default boot pays nothing for courses.
 */
function mountCourseFeature(runtime, environment) {
	const documentValue = environment.document || globalThis.document;
	import('../courses/CourseRuntimeMount.js').then(module => {
		try {
			module.installCourseMenuCard(documentValue, environment);
		} catch (error) { /* menu card is decorative */ }
		const courseId = module.requestedCourseId(environment);
		if (!courseId) return;
		try {
			const receipt = module.mountCourseRuntime(runtime, environment, courseId);
			if (!receipt?.ok) {
				console.warn(`[Mitzvah World] course "${courseId}" not mounted: ${receipt?.reason}`);
			}
		} catch (error) {
			console.warn('[Mitzvah World] course mount failed', error);
		}
	}).catch(() => { /* courses unavailable; the meadow still boots */ });
}
