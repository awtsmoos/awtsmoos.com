//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file StudioNativeEnvironment.js
 * @description Converts MovieDocument lighting semantics into Procedural Core environment intent.
 * Studio owns authored light values and time-of-day meaning; Core owns the actual ambient, sun, fog,
 * exposure, and cinematic preset law so preview and export cannot become a second lighting engine.
 */
import { createCinematicWorldBuildingApi } from '../../../../../libs/awtsmoos-procedural-core/src/core/worldBuilding/index.js';

const WORLD = createCinematicWorldBuildingApi();

/** Return pure semantic environment intent suitable for CinematicWorldBuildingApi.world(). */
export function createStudioEnvironmentIntent(scene = {}) {
	const light = lastLayer(scene, 'light3d');
	const worldLayer = lastLayer(scene, 'world3d');
	const world = worldLayer?.content?.procedural || {};
	return {
		exposure: optionalNumber(world.exposure),
		fogFar: optionalNumber(world.fogFar),
		fogNear: optionalNumber(world.fogNear),
		intensity: Math.max(0.05, Number(light?.data?.intensity ?? 1)),
		sunDirection: light?.data?.direction,
		timeOfDay: world.timeOfDay || world.lighting || 'golden'
	};
}

/** Resolve the renderer contract through Core; this compatibility surface owns no color law. */
export function createStudioNativeEnvironment(scene = {}, worldApi = WORLD) {
	return worldApi.environment(createStudioEnvironmentIntent(scene));
}

function lastLayer(scene, kind) {
	return [...(scene?.layers || [])].reverse().find(layer => layer.kind === kind) || null;
}

function optionalNumber(value) {
	return value == null ? undefined : Number(value);
}
