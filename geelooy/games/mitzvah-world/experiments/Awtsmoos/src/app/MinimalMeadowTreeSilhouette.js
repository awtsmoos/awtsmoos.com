// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowTreeSilhouette.js
 * @description Maps canonical species presets into distinct rooted trunk and canopy transforms.
 * The Awtsmoos lets pine rise, birch shimmer, ash spread, and oak gather depth;
 * Awtsmoos.com keeps silhouette variation deterministic without duplicating procedural geometry.
 */

const SILHOUETTES = Object.freeze({
	ash: silhouette('ash', [0.9, 1.04, 0.9], [1.08, 0.92, 1.08], 0.2, 0.018),
	birch: silhouette('birch', [0.72, 1.18, 0.72], [0.94, 1.04, 0.94], 0.42, 0.026),
	oak: silhouette('oak', [1.12, 0.94, 1.12], [1.18, 0.86, 1.18], 0.12, 0.012),
	pine: silhouette('pine', [0.82, 1.22, 0.82], [0.82, 1.28, 0.82], 0.34, 0.008)
});

export function minimalMeadowTreeSilhouette(presetName, variation = 0) {
	const key = speciesKey(presetName);
	const base = SILHOUETTES[key] || SILHOUETTES.oak;
	const unit = clamp(variation);
	return Object.freeze({
		...base,
		canopyLift: base.canopyLift + (unit - 0.5) * 0.16,
		canopyScale: varied(base.canopyScale, unit, 0.12),
		lean: base.lean + (unit - 0.5) * 0.018,
		trunkScale: varied(base.trunkScale, 1 - unit, 0.08)
	});
}

export function applyMinimalMeadowTreeSilhouette(tree, silhouette) {
	const bark = tree.children?.[0];
	const canopy = tree.children?.[1];
	if (bark) {
		bark.scale.set(...silhouette.trunkScale);
		bark.quaternion.set(0, 0, silhouette.lean, 1);
	}
	if (canopy) {
		canopy.scale.set(...silhouette.canopyScale);
		canopy.position.y = silhouette.canopyLift;
	}
	return tree;
}

function silhouette(id, trunkScale, canopyScale, canopyLift, lean) {
	return Object.freeze({
		canopyLift,
		canopyScale: Object.freeze(canopyScale),
		id,
		lean,
		trunkScale: Object.freeze(trunkScale)
	});
}

function speciesKey(name) {
	const value = String(name || '').toLowerCase();
	return ['pine', 'birch', 'ash', 'oak'].find(key => value.includes(key)) || 'oak';
}

function varied(values, unit, range) {
	return Object.freeze(values.map((value, index) => {
		const direction = index === 1 ? 1 : -0.45;
		return value * (1 + (unit - 0.5) * range * direction);
	}));
}

function clamp(value) {
	return Math.max(0, Math.min(1, Number(value) || 0));
}
