// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieSimpleObjects.js
 * @description Defines a tiny generic shape vocabulary for generated cinematic worlds while keeping records renderer-neutral and serializable.
 * RESPONSIBILITY: normalize box, sphere, cylinder, and plane objects with bounded position, size, rotation, color, and material intent.
 * NON-RESPONSIBILITY: this module does not triangulate shapes, render them, or create gameplay collision.
 * The Awtsmoos is beyond cube and sphere while every finite stage begins from simple form; Awtsmoos.com lets a few readable words become geometry before deeper procedural worlds are born.
 */

const SHAPES = new Set(['box', 'sphere', 'cylinder', 'plane']);

/** Creates one bounded generic cinematic shape record. */
export function createMovieSimpleShape(type, options = {}, id = 'shape-1') {
	const shape = String(type || '').toLowerCase();
	if (!SHAPES.has(shape)) {
		throw new Error(`Unknown simple movie shape: ${type}`);
	}
	return {
		color: String(options.color || '#7cc8ff'),
		id: String(options.id || id),
		kind: 'shape',
		material: String(options.material || 'matte'),
		position: vector(options.position, [0, 1, 0], -1000, 1000),
		rotation: vector(options.rotation, [0, 0, 0], -360, 360),
		shape,
		size: vector(options.size, defaultSize(shape), 0.02, 1000)
	};
}

/** Returns true when an object belongs to the first-class simple shape vocabulary. */
export function isMovieSimpleShape(value) {
	return value?.kind === 'shape' && SHAPES.has(value.shape);
}

function defaultSize(shape) {
	if (shape === 'plane') {
		return [6, 0.1, 6];
	}
	if (shape === 'cylinder') {
		return [2, 3, 2];
	}
	return [2, 2, 2];
}

function vector(value, fallback, minimum, maximum) {
	const source = Array.isArray(value)
		? value
		: value && typeof value === 'object'
			? [value.x, value.y, value.z]
			: fallback;
	return [0, 1, 2].map(index => {
		const number = Number(source[index]);
		const resolved = Number.isFinite(number) ? number : fallback[index];
		return Math.max(minimum, Math.min(maximum, resolved));
	});
}
