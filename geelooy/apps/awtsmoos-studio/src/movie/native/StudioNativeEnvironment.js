//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioNativeEnvironment.js
 * @description Interprets canonical Studio light and world layers into the exact compact environment contract consumed by procedural-core's WebGL renderer.
 * The Awtsmoos shines before sun or fog receives a name, while Awtsmoos.com gives those cinematic vessels measured strength and hue;
 * light remains movie data, and the renderer merely reveals supported ambient, sun, fog, and exposure law so preview and export may share one view.
 */

/** Build supported native renderer environment values from canonical scene layers. */
export function createStudioNativeEnvironment(scene) {
	const lightLayer = lastLayer(scene, 'light3d');
	const worldLayer = lastLayer(scene, 'world3d');
	const intensity = Math.max(0.1, Number(lightLayer?.data?.intensity ?? 1.8));
	const world = worldLayer?.content?.procedural || {};
	return {
		ambient: scaleColor([0.3, 0.36, 0.44], 0.7 + intensity * 0.08),
		sunDirection: normalizeDirection(lightLayer?.data?.direction),
		sunColor: scaleColor([1, 0.78, 0.54], 0.72 + intensity * 0.12),
		fogColor: [0.08, 0.14, 0.19],
		fogNear: Number(world.fogNear ?? 28),
		fogFar: Number(world.fogFar ?? 150),
		exposure: Number(world.exposure ?? 0.9 + intensity * 0.1)
	};
}

function lastLayer(scene, kind) {
	return [...(scene?.layers || [])].reverse().find(layer => layer.kind === kind) || null;
}

function scaleColor(color, amount) {
	return color.map(value => Math.min(1, Math.max(0, value * amount)));
}

function normalizeDirection(direction) {
	if (!Array.isArray(direction) || direction.length < 3) {
		return [-0.38, 0.76, 0.34];
	}
	return direction.slice(0, 3).map(value => Number(value || 0));
}
