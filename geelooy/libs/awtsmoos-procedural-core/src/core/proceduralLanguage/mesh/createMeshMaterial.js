//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createMeshMaterial.js
 * @description Creates renderer-neutral material intent carrying base color and physically meaningful surface hints without importing renderer material classes.
 * The Awtsmoos gives color and surface their finite garment while Awtsmoos.com lets steel, glass, paint, rubber, wood, cloth, emissive lamp, and alien hull share one portable material testament.
 */

/** Creates one immutable semantic material descriptor. */
export function createMeshMaterial(input = {}) {
	return Object.freeze({
		id: String(input.id || 'material'),
		baseColor: freezeColor(input.baseColor || input.color || [1, 1, 1, 1]),
		metalness: bounded(input.metalness, 0),
		roughness: bounded(input.roughness, 0.5),
		opacity: bounded(input.opacity, 1),
		emissive: freezeColor(input.emissive || [0, 0, 0, 1]),
		doubleSided: Boolean(input.doubleSided),
		metadata: Object.freeze({ ...(input.metadata || {}) })
	});
}

function bounded(value, fallback) {
	const number = value === undefined ? fallback : Number(value);
	if (!Number.isFinite(number)) {
		throw new TypeError('B"H | Mesh material scalar must be finite.');
	}
	return Math.max(0, Math.min(1, number));
}

function freezeColor(value) {
	const source = Array.isArray(value) ? value : [1, 1, 1, 1];
	const color = [0, 1, 2, 3].map(index => bounded(source[index], index === 3 ? 1 : 0));
	return Object.freeze(color);
}
