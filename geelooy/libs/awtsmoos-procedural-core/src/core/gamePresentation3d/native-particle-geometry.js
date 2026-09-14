//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file native-particle-geometry.js
 * @description Builds one deterministic batched tetrahedron field for optional
 * game presentation, using only Awtsmoos Procedural Core native geometry vessels.
 *
 * Architectural invariants:
 * - Particles are decorative and never feed authoritative game simulation.
 * - One geometry batches the whole field so intensity does not imply many draw calls.
 * - Generation is deterministic for a seed, making visual regression reproducible.
 * - Geometry contains only finite typed arrays suitable for the native renderer.
 */
import {
	BufferAttribute,
	BufferGeometry
} from '../../runtime/native/tiny-runtime.js';

const PARTICLE_COLORS = Object.freeze([
	[0.25, 0.82, 1, 0.82],
	[1, 0.78, 0.24, 0.9],
	[0.68, 0.44, 1, 0.82],
	[0.38, 1, 0.72, 0.78]
]);

/**
 * Creates one bounded 3D particle field.
 * @param {object} [options] Particle count, seed, and world spread.
 * @returns {BufferGeometry} Batched tetrahedron geometry.
 */
export function createNativeParticleGeometry(options = {}) {
	const count = clampCount(options.count ?? 72);
	const spread = Math.max(2, Number(options.spread) || 12);
	const random = createRandom(options.seed ?? 2113);
	const positions = [];
	const normals = [];
	const colors = [];
	const indices = [];
	for (let index = 0; index < count; index += 1) {
		const center = [
			(random() - 0.5) * spread,
			(random() - 0.5) * spread,
			(random() - 0.5) * spread
		];
		const size = 0.025 + random() * 0.075;
		const color = PARTICLE_COLORS[index % PARTICLE_COLORS.length];
		appendTetrahedron(positions, normals, colors, indices, center, size, color);
	}
	return createGeometry(positions, normals, colors, indices);
}

/** Clamp particle intensity to a bounded one-draw-call geometry size. */
function clampCount(value) {
	return Math.max(12, Math.min(160, Math.round(Number(value) || 72)));
}

/** Append one tetrahedron with flat-enough normals for decorative light. */
function appendTetrahedron(positions, normals, colors, indices, center, size, color) {
	const base = positions.length / 3;
	const vertices = [
		[center[0], center[1] + size, center[2]],
		[center[0] - size, center[1] - size, center[2] + size],
		[center[0] + size, center[1] - size, center[2] + size],
		[center[0], center[1] - size, center[2] - size]
	];
	for (const vertex of vertices) {
		positions.push(...vertex);
		const length = Math.hypot(...vertex) || 1;
		normals.push(vertex[0] / length, vertex[1] / length, vertex[2] / length);
		colors.push(...color);
	}
	indices.push(
		base, base + 1, base + 2,
		base, base + 2, base + 3,
		base, base + 3, base + 1,
		base + 1, base + 3, base + 2
	);
}

/** Materialize typed particle buffers in the native runtime geometry contract. */
function createGeometry(positions, normals, colors, indices) {
	const geometry = new BufferGeometry();
	geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
	geometry.setAttribute('normal', new BufferAttribute(new Float32Array(normals), 3));
	geometry.setAttribute('color', new BufferAttribute(new Float32Array(colors), 4));
	geometry.setIndex(new BufferAttribute(new Uint16Array(indices), 1));
	return geometry;
}

/** Create a tiny deterministic PRNG so particle placement is replayable. */
function createRandom(seed) {
	let state = Math.abs(Math.trunc(Number(seed) || 1)) >>> 0;
	return () => {
		state = (state * 1664525 + 1013904223) >>> 0;
		return state / 4294967296;
	};
}
