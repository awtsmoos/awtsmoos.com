// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SurvivalSixtyFpsRun.js
 * @description Starts one sparse five-minute survival measurement only after the playable runtime exists.
 * The Awtsmoos renews each frame without waiting for our finite proof;
 * Awtsmoos.com lets the recorder witness the meadow, then publishes one sealed receipt beneath its roof.
 */

import {
	createSurvivalFrameRecorder,
	SURVIVAL_RECORDER_GLOBAL,
	SURVIVAL_REPORT_GLOBAL
} from './SurvivalFrameRecorder.js';
import { isSurvivalQuality } from './SurvivalQualityPolicy.js';
import { resolveWorldQuality } from './WorldQualityProfile.js';
import { survivalRecorderRequested } from './SurvivalBenchmarkQuery.js';
import { survivalSixtyFpsProfile } from './SurvivalSixtyFpsDefinition.js';
import { verifySurvivalRuntime } from './SurvivalRuntimeVerification.js';
import { publishMitzvahWorldSurvivalReceipt } from './MitzvahWorldSurvivalReceiptPublisher.js';

/** Preserves the public Chapter 4 request helper while accepting benchmark=survival. */
export function survivalSixtyFpsRequested(options = {}, environment = globalThis) {
	return survivalRecorderRequested(options, environment);
}

/** Starts one five-minute run and publishes the enriched Chapter 5 receipt on completion. */
export function startSurvivalSixtyFpsRun(runtime, options = {}, environment = globalThis) {
	const profile = survivalSixtyFpsProfile(options, environment);
	const verification = verifySurvivalRuntime(runtime, profile);
	if (!verification.ok) return failedRun(profile, verification);
	const recorder = createSurvivalFrameRecorder({
		deviceClass: profile.deviceClass,
		environment,
		onReport: report => publishMitzvahWorldSurvivalReceipt(
			report,
			runtime,
			profile,
			environment
		),
		profile,
		runtime
	});
	const started = recorder.start();
	try {
		environment[SURVIVAL_RECORDER_GLOBAL] = recorder;
	} catch {}
	return Object.freeze({
		profile,
		recorder,
		reason: started ? 'recording' : 'raf-unavailable',
		started,
		verification
	});
}

/** Starts only when requested and when the loaded world is actually survival quality. */
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
		const run = startSurvivalSixtyFpsRun(runtime, options, environment);
		if (run.started) announceRun(run, environment);
		return run;
	} catch (error) {
		environment?.console?.warn?.('B"H Survival benchmark failed to start; play continues unmeasured.', error);
		return Object.freeze({ started: false, reason: 'recorder-start-failed' });
	}
}

function failedRun(profile, verification) {
	return Object.freeze({
		profile,
		recorder: null,
		reason: 'profile-verification-failed',
		started: false,
		verification
	});
}

function announceRun(run, environment) {
	environment?.console?.info?.(
		`B"H Survival benchmark recording ${run.profile.durationMs / 1000}s `
		+ `(device ${run.profile.deviceClass}, maxDpr ${run.profile.maxDpr}). `
		+ `Raw report: globalThis.${SURVIVAL_REPORT_GLOBAL}.`
	);
}
