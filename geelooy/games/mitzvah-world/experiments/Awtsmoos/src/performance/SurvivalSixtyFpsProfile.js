// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SurvivalSixtyFpsProfile.js
 * @description The ONE game-local survival profile for Mitzvah World Chapter 4, Task 1:
 * one spawn chunk, the canonical Chossid, camera/movement/collision, one directional
 * light, and the essential HUD — nothing else. It resolves the device-class DPR cap,
 * verifies every optional system is gated off, and wires the 5-minute frame recorder
 * into a survival run. It does not measure anything itself: frame times can only be
 * proven on real hardware (MacBook Air or Pixel), never in this VM.
 */

import { runtimeAcceptanceScene } from './RuntimeAcceptanceScenes.js';
import {
	createSurvivalFrameRecorder,
	copyableSurvivalSummary,
	SURVIVAL_RECORDER_GLOBAL,
	SURVIVAL_REPORT_GLOBAL,
	SURVIVAL_SIXTY_FPS_DURATION_MS
} from './SurvivalFrameRecorder.js';
import {
	isSurvivalQuality,
	survivalDeviceClass,
	survivalFeatureOverride,
	survivalOptionalFeatures
} from './SurvivalQualityPolicy.js';
import {
	resolveWorldQuality,
	shadowTierForWorldQuality
} from './WorldQualityProfile.js';

export const SURVIVAL_SIXTY_FPS_SCENE_ID = 'survival-spawn';
export const SURVIVAL_SIXTY_FPS_FLAG = 'survival60';

/** Everything the survival profile contains — and the whole list. One chunk, one Chossid. */
export const SURVIVAL_PROFILE_CONTENTS = Object.freeze({
	hud: 'essential-only',
	lighting: Object.freeze(['one-directional-light']),
	player: 'canonical-chossid-glb',
	spawnChunks: 1,
	systems: Object.freeze(['camera', 'movement', 'collision'])
});

/** The only systems survival keeps awake besides the contents above. */
export const SURVIVAL_ENABLED_FEATURES = Object.freeze([
	'performanceMonitor',
	'camera',
	'movement',
	'collision',
	'essentialHud',
	'oneDirectionalLight'
]);

/**
 * Resolves the frozen survival profile for a run. The quality is always survival here;
 * the device class (options.deviceClass or ?deviceClass=) selects the DPR cap:
 * macbook-air-2015 at 1.0, pixel-6-pro at ~1.25, no class at the 1.0 default.
 */
export function survivalSixtyFpsProfile(options = {}, environment = globalThis) {
	const deviceClass = survivalDeviceClass(options, environment);
	const qualityProfile = resolveWorldQuality(
		{ deviceClass, quality: 'survival', search: options.search },
		environment
	);
	return Object.freeze({
		contents: SURVIVAL_PROFILE_CONTENTS,
		deviceClass,
		deviceDprCapReason: qualityProfile.deviceDprCapReason,
		disabledFeatures: survivalOptionalFeatures(),
		durationMs: SURVIVAL_SIXTY_FPS_DURATION_MS,
		enabledFeatures: SURVIVAL_ENABLED_FEATURES,
		maxDpr: qualityProfile.maxDpr,
		modelLimit: qualityProfile.modelLimit,
		quality: 'survival',
		renderDistance: qualityProfile.renderDistance,
		scene: runtimeAcceptanceScene(SURVIVAL_SIXTY_FPS_SCENE_ID),
		sceneId: SURVIVAL_SIXTY_FPS_SCENE_ID,
		shadowTier: shadowTierForWorldQuality('survival')
	});
}

/** Returns the enabled/disabled verdict for every survival-gated feature, plus diagnostics. */
export function survivalSixtyFpsFeatureGates(options = {}) {
	const survivalOptions = { qualityProfile: { quality: 'survival' }, ...options };
	const gates = {};
	for (const feature of survivalOptionalFeatures()) {
		gates[feature] = survivalFeatureOverride(survivalOptions, feature);
	}
	gates.performanceMonitor = survivalFeatureOverride(survivalOptions, 'performanceMonitor');
	return Object.freeze(gates);
}

/** True when the owner asked for a 5-minute survival run (?survival60=1 or survival60: true). */
export function survivalSixtyFpsRequested(options = {}, environment = globalThis) {
	if (options?.survival60 === true) return true;
	const search = options?.search ?? environment?.location?.search ?? '';
	if (!search) return false;
	try {
		return new URLSearchParams(search).get(SURVIVAL_SIXTY_FPS_FLAG) === '1';
	} catch {
		return false;
	}
}

/**
 * Checks what a live runtime can prove about the profile, without blocking the run on
 * evidence the runtime object does not carry. Contradictory evidence (wrong quality,
 * DPR cap above the profile) fails; missing evidence is reported as unverified, not
 * passed, and the final report carries the whole verification section.
 */
export function verifySurvivalRuntime(runtime, profile) {
	const failures = [];
	const unverified = [];
	const foundQuality = runtime?.qualityProfile?.quality
		?? runtime?.options?.qualityProfile?.quality
		?? runtime?.diagnostics?.qualityProfile?.quality
		?? null;
	if (foundQuality !== null && foundQuality !== 'survival') {
		failures.push(`QUALITY_NOT_SURVIVAL:${foundQuality}`);
	}
	if (foundQuality === null) unverified.push('quality: no qualityProfile on the runtime object');
	const foundMaxDpr = runtime?.qualityProfile?.maxDpr
		?? runtime?.options?.qualityProfile?.maxDpr
		?? runtime?.renderer?.qualityProfile?.maxDpr
		?? null;
	if (foundMaxDpr !== null && foundMaxDpr > profile.maxDpr) {
		failures.push(`MAX_DPR_ABOVE_PROFILE:${foundMaxDpr}>${profile.maxDpr}`);
	}
	if (foundMaxDpr === null) unverified.push('maxDpr: no qualityProfile maxDpr on the runtime object');
	const gates = survivalSixtyFpsFeatureGates();
	const gatesOff = Object.entries(gates)
		.filter(([, enabled]) => enabled === false)
		.map(([feature]) => feature);
	return Object.freeze({
		failures: Object.freeze(failures),
		foundMaxDpr,
		foundQuality,
		gatesOff: Object.freeze(gatesOff),
		ok: failures.length === 0,
		performanceMonitorOn: gates.performanceMonitor === true,
		unverified: Object.freeze(unverified)
	});
}

/**
 * Starts the 5-minute survival run on a live runtime and returns its handle.
 * The recorder samples frames on its own animation-frame chain and publishes the frozen
 * report to globalThis.AwtsmoosSurvivalSixtyFpsReport when the run ends.
 */
export function startSurvivalSixtyFpsRun(runtime, options = {}, environment = globalThis) {
	const profile = survivalSixtyFpsProfile(options, environment);
	const verification = verifySurvivalRuntime(runtime, profile);
	if (!verification.ok) {
		return Object.freeze({
			profile,
			recorder: null,
			started: false,
			reason: 'profile-verification-failed',
			verification
		});
	}
	const recorder = createSurvivalFrameRecorder({
		deviceClass: profile.deviceClass,
		environment,
		profile,
		runtime
	});
	const started = recorder.start();
	try {
		environment[SURVIVAL_RECORDER_GLOBAL] = recorder;
	} catch {
		// A frozen test environment must never break the run itself.
	}
	return Object.freeze({
		profile,
		recorder,
		started,
		reason: started ? 'recording' : 'raf-unavailable',
		verification
	});
}

/**
 * Boot hook: starts the run only when the owner asked for it AND the world is survival.
 * Never throws and never blocks boot; a failed start is a console warning, not a crash.
 * Used by the staged and minimal boot paths (EretzStagedRuntime, MinimalMeadowRuntimeCore).
 */
export async function maybeStartSurvivalSixtyFpsRun(runtime, options = {}, environment = globalThis) {
	try {
		if (!survivalSixtyFpsRequested(options, environment)) {
			return Object.freeze({ started: false, reason: 'survival60-flag-absent' });
		}
		if (!isSurvivalQuality(options)
			&& !isSurvivalQuality(runtime?.qualityProfile)
			&& !isSurvivalQuality(resolveWorldQuality(options, environment))) {
			return Object.freeze({ started: false, reason: 'quality-not-survival' });
		}
		const run = startSurvivalSixtyFpsRun(runtime, options, environment);
		if (run.started) {
			environment?.console?.info?.(
				`B"H Survival 60 FPS run recording for ${run.profile.durationMs / 1000}s `
				+ `(device class ${run.profile.deviceClass}, maxDpr ${run.profile.maxDpr}). `
				+ `Report will appear at globalThis.${SURVIVAL_REPORT_GLOBAL}.`
			);
		}
		return run;
	} catch (error) {
		environment?.console?.warn?.('B"H Survival 60 FPS recorder failed to start; play continues unmeasured.', error);
		return Object.freeze({ started: false, reason: 'recorder-start-failed' });
	}
}

export { copyableSurvivalSummary, SURVIVAL_REPORT_GLOBAL, SURVIVAL_SIXTY_FPS_DURATION_MS };
export default survivalSixtyFpsProfile;
