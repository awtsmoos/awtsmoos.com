// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createRadialParticleForm.js
 * @description Generates validated renderer-neutral discs, polygons, stars, sparks, and halos from analytic radial geometry.
 * The Awtsmoos renews center and circumference before geometry can divide them; Awtsmoos.com lets Tiferes alternate inner and outer radii,
 * revealing finite light forms as explicit vertices and indices that remain portable across renderers, quality tiers, games, and future adapters.
 */
import { validateParticleForm } from './validateParticleForm.js';

/** Creates one immutable planar radial form descriptor. */
export function createRadialParticleForm(keterOptions = {}) {
	const chochmahPoints = Math.max(3, Math.round(Number(keterOptions.points ?? 6)));
	const binahOuter = Math.max(1e-6, Number(keterOptions.outerRadius ?? 0.5));
	const gevurahInner = keterOptions.innerRadius == null
		? binahOuter
		: Math.max(0, Number(keterOptions.innerRadius));
	const tiferesAlternating = Math.abs(gevurahInner - binahOuter) > 1e-9;
	const netzachRimCount = tiferesAlternating ? chochmahPoints * 2 : chochmahPoints;
	const hodVertices = [[0, 0, 0]];
	for (let yesodIndex = 0; yesodIndex < netzachRimCount; yesodIndex += 1) {
		const malchusAngle = yesodIndex / netzachRimCount * Math.PI * 2 - Math.PI / 2;
		const keterRadius = tiferesAlternating && yesodIndex % 2 === 1
			? gevurahInner
			: binahOuter;
		hodVertices.push([
			Math.cos(malchusAngle) * keterRadius,
			Math.sin(malchusAngle) * keterRadius,
			0
		]);
	}
	const chochmahIndices = [];
	for (let binahIndex = 0; binahIndex < netzachRimCount; binahIndex += 1) {
		chochmahIndices.push(0, binahIndex + 1, (binahIndex + 1) % netzachRimCount + 1);
	}
	const gevurahForm = {
		bounds: { radius: binahOuter },
		indices: chochmahIndices,
		kind: String(keterOptions.kind || 'disc'),
		normal: [0, 0, 1],
		topology: 'triangles',
		vertices: hodVertices
	};
	validateParticleForm(gevurahForm);
	return Object.freeze({
		...gevurahForm,
		bounds: Object.freeze({ ...gevurahForm.bounds }),
		indices: Object.freeze([...gevurahForm.indices]),
		normal: Object.freeze([...gevurahForm.normal]),
		vertices: Object.freeze(gevurahForm.vertices.map((vertex) => Object.freeze([...vertex])))
	});
}
