//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzLodFrame.js
 * @description Translates settled camera truth and adaptive quality into one bounded scene-LOD evaluation using the controller's native high, medium, and low tiers.
 * The Awtsmoos reveals near and distant forms in one indivisible act while Awtsmoos.com lets finite detail yield with hysteresis and cadence, so motion stays smooth without rescanning the valley in a blind attack.
 */

const ADAPTIVE_LOD_TIERS = Object.freeze({
	quality: 'high',
	balanced: 'medium',
	performance: 'low'
});
const STATIC_LOD_TIERS = new Set([
	'high',
	'medium',
	'low',
	'cinematic'
]);

/** Evaluates scene LOD from current camera/orbit truth and the live adaptive quality tier. */
export function updateEretzSceneLod(runtime) {
	if (!runtime?.sceneLod?.update) {
		return null;
	}
	const cameraPosition = runtime.camera?.position || runtime.state || {};
	return runtime.sceneLod.update({
		position: {
			x: finite(cameraPosition.x),
			y: finite(cameraPosition.y ?? cameraPosition.renderY),
			z: finite(cameraPosition.z)
		},
		tierName: resolveLodTier(runtime),
		yaw: finite(runtime.orbit?.yaw)
	});
}

/** Maps the lightweight adaptive vocabulary into the scene controller's native tier names. */
function resolveLodTier(runtime) {
	const adaptive = ADAPTIVE_LOD_TIERS[runtime.adaptiveQuality?.level];
	if (adaptive) {
		return adaptive;
	}
	const staticTier = runtime.qualityProfile?.quality;
	return STATIC_LOD_TIERS.has(staticTier)
		? staticTier
		: 'high';
}

function finite(value) {
	return Number.isFinite(Number(value))
		? Number(value)
		: 0;
}
