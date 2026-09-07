// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzCinematicEnvironment.js
 * @description Applies one idempotent post-play golden-hour environment through renderer state that already survives rich WebGL hydration.
 * The Awtsmoos paints no counterfeit backdrop: one real sun, fog, sky, and ambient covenant deepens the living meadow after movement;
 * Awtsmoos.com lets cinematic warmth arrive as a degradable garment, never as a gate standing between the traveler and the first step.
 */

import { REFERENCE_GOLDEN_HOUR } from '../world/lighting/ReferenceGoldenHourPreset.js';

/** Schedules cinematic presentation without allowing visual failure to reject gameplay. */
export function scheduleEretzCinematicEnvironment(
	runtime,
	environment = globalThis
) {
	if (runtime.cinematicEnvironmentPromise) {
		return runtime.cinematicEnvironmentPromise;
	}
	runtime.cinematicEnvironmentStage = 'scheduled';
	runtime.cinematicEnvironmentPromise = Promise.resolve()
		.then(() => installEretzCinematicEnvironment(runtime, environment))
		.catch(error => degradedReceipt(runtime, error));
	return runtime.cinematicEnvironmentPromise;
}

/** Applies supported renderer/environment state exactly once and publishes a clone-safe receipt. */
export function installEretzCinematicEnvironment(
	runtime,
	environment = globalThis
) {
	if (runtime.cinematicEnvironment) return runtime.cinematicEnvironment;
	const renderer = runtime.renderer;
	if (typeof renderer?.setEnvironment !== 'function') {
		throw new Error('Cinematic environment requires renderer.setEnvironment().');
	}
	const portrait = isPortraitTouch(environment);
	const palette = REFERENCE_GOLDEN_HOUR.cinematic;
	const renderDistance = Number(
		runtime.qualityProfile?.renderDistance
		|| renderer.options?.defaultRenderDistance
		|| 520
	);
	runtime.cinematicEnvironmentStage = 'installing';
	renderer.setClearColor?.(...palette.skyColor, 1);
	renderer.setEnvironment({
		ambient: palette.ambient,
		exposure: portrait ? palette.exposureMobile : palette.exposureDesktop,
		fogColor: palette.fogColor,
		fogFar: renderDistance * 1.16,
		fogNear: renderDistance * 0.34,
		skyColor: palette.skyColor,
		sunColor: palette.sunColor,
		sunDirection: normalized(REFERENCE_GOLDEN_HOUR.sunPosition)
	});
	const receipt = Object.freeze({
		exposure: portrait ? palette.exposureMobile : palette.exposureDesktop,
		mode: portrait ? 'portrait-golden-hour' : 'golden-hour',
		renderDistance,
		status: 'ready'
	});
	runtime.cinematicEnvironment = receipt;
	runtime.cinematicEnvironmentStage = 'ready';
	markDocument(environment.document, 'ready');
	return receipt;
}

function degradedReceipt(runtime, error) {
	runtime.cinematicEnvironmentError = error;
	runtime.cinematicEnvironmentStage = 'degraded';
	return Object.freeze({
		message: error?.message || String(error),
		status: 'degraded'
	});
}

function isPortraitTouch(environment) {
	const width = Math.max(1, Number(environment.innerWidth) || 1);
	const height = Math.max(1, Number(environment.innerHeight) || 1);
	const touch = Number(environment.navigator?.maxTouchPoints) > 0
		|| environment.matchMedia?.('(pointer: coarse)')?.matches === true;
	return touch && width / height < 0.82;
}

function markDocument(documentValue, state) {
	if (!documentValue) return;
	documentValue.documentElement.dataset.awtsmoosCinematic = state;
	const root = documentValue.getElementById?.('mitzvah-world-root');
	if (root) root.dataset.awtsmoosCinematic = state;
}

function normalized(vector) {
	const length = Math.hypot(vector[0], vector[1], vector[2]) || 1;
	return [vector[0] / length, vector[1] / length, vector[2] / length];
}
