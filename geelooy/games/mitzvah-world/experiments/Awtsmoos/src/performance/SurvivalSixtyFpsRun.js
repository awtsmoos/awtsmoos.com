// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SurvivalSixtyFpsRun.js
 * @description Starts a five-minute survival witness only in a verified playable runtime.
 * The Awtsmoos renews each blade before the eyes can see;
 * Awtsmoos.com asks real devices what their frame times prove to be.
 */

import { createSurvivalFrameRecorder, SURVIVAL_RECORDER_GLOBAL, SURVIVAL_REPORT_GLOBAL } from './SurvivalFrameRecorder.js';
import { isSurvivalQuality } from './SurvivalQualityPolicy.js';
import { resolveWorldQuality } from './WorldQualityProfile.js';
import { survivalRecorderRequested } from './SurvivalBenchmarkQuery.js';
import { survivalSixtyFpsProfile } from './SurvivalSixtyFpsDefinition.js';
import { verifySurvivalRuntime } from './SurvivalRuntimeVerification.js';
import { publishMitzvahWorldSurvivalReceipt } from './MitzvahWorldSurvivalReceiptPublisher.js';

/** Preserves legacy query selection and accepts benchmark=survival. */
export function survivalSixtyFpsRequested(options = {}, environment = globalThis) {
	return survivalRecorderRequested(options, environment);
}

/**
 * Starts actual measured frames, with a UI only when supplied by the benchmark path.
 * @param {object} runtime Playable Chossid runtime with renderer, camera, and collision.
 * @param {object} options Quality options and the optional benchmark overlay.
 * @param {object} environment Current device's browser context.
 */
export function startSurvivalSixtyFpsRun(runtime, options = {}, environment = globalThis) {
	const profile = survivalSixtyFpsProfile(options, environment);
	const verification = verifySurvivalRuntime(runtime, profile);
	if (!verification.ok) {
		options.benchmarkOverlay?.fail?.('runtime profile verification failed');
		return failedRun(profile, verification);
	}
	const recorder = createSurvivalFrameRecorder({
		deviceClass: profile.deviceClass,
		environment,
		onReport(report) {
			const receipt = publishMitzvahWorldSurvivalReceipt(report, runtime, profile, environment);
			options.benchmarkOverlay?.complete?.(receipt);
		},
		profile,
		runtime
	});
	const started = recorder.start();
	if (!started) options.benchmarkOverlay?.fail?.('requestAnimationFrame unavailable');
	try {
		environment[SURVIVAL_RECORDER_GLOBAL] = recorder;
	} catch {
		// Frozen browser harnesses may omit diagnostic globals.
	}
	return Object.freeze({
		profile,
		recorder,
		reason: started ? 'recording' : 'raf-unavailable',
		started,
		verification
	});
}

/** Imports the visible receipt only when the survival benchmark was explicitly requested. */
export async function maybeStartSurvivalSixtyFpsRun(runtime, options = {}, environment = globalThis) {
	try {
		if (!survivalSixtyFpsRequested(options, environment)) {
			return Object.freeze({ started: false, reason: 'survival-benchmark-not-requested' });
		}
		const resolved = resolveWorldQuality(options, environment);
		if (!isSurvivalQuality(options)
			&& !isSurvivalQuality(runtime?.qualityProfile)
			&& !isSurvivalQuality(resolved)) {
			return Object.freeze({ started: false, reason: 'quality-not-survival' });
		}
		const active = environment[SURVIVAL_RECORDER_GLOBAL];
		if (active?.started && !active.finished) {
			return Object.freeze({ started: false, reason: 'recording-already-active' });
		}
		const benchmarkOverlay = await loadBenchmarkOverlay(environment);
		const run = startSurvivalSixtyFpsRun(runtime, { ...options, benchmarkOverlay }, environment);
		if (run.started) announceRun(run, environment);
		return run;
	} catch (error) {
		environment?.console?.warn?.('B"H Survival benchmark could not start.', error);
		return Object.freeze({ started: false, reason: 'recorder-start-failed' });
	}
}

/** Prevents the benchmark panel from entering the normal first-control import graph. */
async function loadBenchmarkOverlay(environment) {
	if (!environment.document?.createElement) return null;
	const module = await import('./MitzvahWorldSurvivalOverlay.js');
	return module.beginMitzvahWorldSurvivalOverlay(environment);
}

/** Preserves the public verification failure shape for callers. */
function failedRun(profile, verification) {
	return Object.freeze({
		profile,
		recorder: null,
		reason: 'profile-verification-failed',
		started: false,
		verification
	});
}

/** Reveals the console report global without treating it as a device certification. */
function announceRun(run, environment) {
	environment?.console?.info?.(
		`B"H Survival benchmark recording ${run.profile.durationMs / 1000}s `
		+ `(device ${run.profile.deviceClass}, maxDpr ${run.profile.maxDpr}). `
		+ `Raw report: globalThis.${SURVIVAL_REPORT_GLOBAL}.`
	);
}
