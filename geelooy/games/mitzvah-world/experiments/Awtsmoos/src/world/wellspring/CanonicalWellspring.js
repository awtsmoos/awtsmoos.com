// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalWellspring.js
 * @description Names the bounded implicit-water volume that emerges at the canonical river source and hands off downstream.
 * The Awtsmoos creates concealed reservoir and revealed river as one current; Awtsmoos.com records the finite grid, pressure,
 * field algorithm, and hydrology handoff so gameplay, Studio, tests, and future posts rebuild the same spring without private defaults.
 */

export const CANONICAL_WELLSPRING_VERSION = '2026.08-wellspring-v1';

export function canonicalWellspringContract(hydrology) {
	const source = hydrology?.points?.[0];
	const next = hydrology?.points?.[1];
	if (!source || !next) throw new Error('Canonical wellspring requires the first two hydrology samples.');
	const flow = Object.freeze([next.x - source.x, next.z - source.z]);
	return Object.freeze({
		algorithm: 'cube-grid-six-tetrahedra-v1',
		center: Object.freeze([source.x, source.y - 0.7, source.z]),
		field: 'wellspring',
		flow,
		handoff: Object.freeze({ riverId: 'canonical-village-river', t: 0 }),
		id: 'canonical-mountain-wellspring',
		isoLevel: 0,
		origin: Object.freeze([source.x + flow[0] * 0.08, source.y - 0.35, source.z + flow[1] * 0.08]),
		pressure: 0.92,
		resolution: Object.freeze([18, 12, 24]),
		seed: 613,
		size: Object.freeze([8.5, 5.2, 11.5]),
		triangleBudget: 14000,
		version: CANONICAL_WELLSPRING_VERSION
	});
}
