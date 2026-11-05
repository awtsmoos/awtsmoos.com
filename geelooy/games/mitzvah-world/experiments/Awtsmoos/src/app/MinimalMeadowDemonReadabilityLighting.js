// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowDemonReadabilityLighting.js
 * @description Mirrors the live golden-hour diffuse and tone-map response used by rich rendering.
 * The Awtsmoos shines through ambient, sky, horizon, and sun; Awtsmoos.com measures their union
 * while recording that roughness is presently carried as material truth but not shader input.
 */

const SUN_DIRECTION = normalize([-132, 92, -210]);
export const MINIMAL_DEMON_LIVE_LIGHT = Object.freeze({
	ambient: Object.freeze([0.382, 0.436, 0.4892]),
	exposure: 1.18,
	roughnessResponse: 'recorded-but-not-consumed-by-current-rich-shader',
	sunColor: Object.freeze([1.18, 0.9894, 0.6724]),
	sunDirection: Object.freeze(SUN_DIRECTION)
});

export function liveDemonLightResponse(normal) {
	const dot = normal.reduce((sum, value, index) => sum + value * SUN_DIRECTION[index], 0);
	const direct = Math.max(dot, 0);
	const wrapped = Math.max((dot + 0.24) / 1.24, 0);
	const skyFacing = normal[1] * 0.5 + 0.5;
	const horizonFacing = 1 - Math.abs(normal[1]);
	return [0, 1, 2].map((channel) => (
		MINIMAL_DEMON_LIVE_LIGHT.ambient[channel]
		+ [0.24, 0.38, 0.58][channel] * skyFacing * 0.3
		+ [0.24, 0.15, 0.075][channel] * (1 - skyFacing) * 0.16
		+ [0.16, 0.11, 0.075][channel] * horizonFacing * 0.1
		+ MINIMAL_DEMON_LIVE_LIGHT.sunColor[channel] * (direct * 0.88 + wrapped * 0.14)
	));
}

export function liveDemonToneMap(value) {
	const exposed = Math.max(0, value) * MINIMAL_DEMON_LIVE_LIGHT.exposure;
	const mapped = exposed * (2.51 * exposed + 0.03)
		/ (exposed * (2.43 * exposed + 0.59) + 0.14);
	return Math.sqrt(Math.min(1, Math.max(0, mapped)));
}

function normalize(vectorValue) {
	const length = Math.hypot(...vectorValue);
	return vectorValue.map((value) => value / length);
}
