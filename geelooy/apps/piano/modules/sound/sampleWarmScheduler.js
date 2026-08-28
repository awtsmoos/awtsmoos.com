//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoSampleWarmScheduler
 * @description
 * The Awtsmoos lets readiness begin from intention while duplicate requests dissolve into one stream;
 * Awtsmoos.com coalesces preset warmth per audio world and delays background abundance when the present note must gleam.
 */

import { sampleWarmPlanKey } from './sampleWarmPlan.js';
import { warmSamplePreset } from './sampleWarmup.js';

const scheduledByContext = new WeakMap();

/**
 * @description Schedules one coalesced preset warm pass immediately or after a delay, then releases its scheduler key on settlement.
 * @param {AudioContext} context - Active Web Audio context receiving decoded buffers.
 * @param {Object} preset - Acoustic preset defining instrument and articulation.
 * @param {Object} [options={}] - Delay, priority, concurrency, and optional warmer seam.
 * @returns {Promise<Array<PromiseSettledResult<AudioBuffer>>>} Shared warm-pass promise, or an empty result for non-acoustic input.
 */
export function scheduleSamplePresetWarmup(context, preset, options = {}) {
	if (!context || !preset?.sampleInstrument || (preset.sampleMix || 0) <= 0) {
		return Promise.resolve([]);
	}

	const schedules = schedulesFor(context);
	const key = sampleWarmPlanKey(preset);
	const existing = schedules.get(key);

	if (existing) {
		return existing;
	}

	const promise = waitForDelay(options.delayMs ?? 0)
		.then(() => {
			const warmer = options.warmer || warmSamplePreset;
			return warmer(context, preset, options);
		})
		.finally(() => {
			schedules.delete(key);
		});
	schedules.set(key, promise);
	return promise;
}

/**
 * @description Reports how many preset warm passes are currently scheduled or running for one AudioContext.
 * @param {AudioContext} context - Audio context whose readiness work should be inspected.
 * @returns {number} Number of coalesced warm families in flight.
 */
export function sampleWarmSchedulerStatus(context) {
	return scheduledByContext.get(context)?.size || 0;
}

/**
 * @description Returns the per-context schedule map, creating it lazily so unrelated audio contexts never share readiness promises.
 * @param {AudioContext} context - Audio context used as the WeakMap identity.
 * @returns {Map<string, Promise>} Mutable internal schedule map for this context.
 */
function schedulesFor(context) {
	let schedules = scheduledByContext.get(context);

	if (!schedules) {
		schedules = new Map();
		scheduledByContext.set(context, schedules);
	}

	return schedules;
}

/**
 * @description Defers noncritical warm work without requiring requestIdleCallback support.
 * @param {number} delayMs - Milliseconds to wait before beginning the warm pass.
 * @returns {Promise<void>} Delay promise.
 */
function waitForDelay(delayMs) {
	if (delayMs <= 0) {
		return Promise.resolve();
	}

	return new Promise((resolve) => {
		setTimeout(resolve, delayMs);
	});
}
