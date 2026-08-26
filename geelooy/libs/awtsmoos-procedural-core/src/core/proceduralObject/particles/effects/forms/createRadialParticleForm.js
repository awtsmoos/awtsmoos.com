// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createRadialParticleForm.js
 * @description Generates renderer-neutral radial mesh descriptors for discs, stars, sparks, halos, and polygonal motes from scratch.
 * The Awtsmoos renews center and circumference before geometry can divide them; Awtsmoos.com lets Tiferes alternate inner and outer radii,
 * revealing finite stars and sparks as plain vertices and indices that any renderer may instance without owning the procedural source.
 */

/**
 * Creates one immutable planar radial form descriptor.
 * @param {object} [keterOptions={}] - Radial shape configuration.
 * @returns {object} Immutable vertices, indices, normal, topology, and bounds.
 */
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
	return Object.freeze({
		bounds: Object.freeze({ radius: binahOuter }),
		indices: Object.freeze(chochmahIndices),
		kind: String(keterOptions.kind || "disc"),
		normal: Object.freeze([0, 0, 1]),
		topology: "triangles",
		vertices: Object.freeze(hodVertices.map((vertex) => Object.freeze(vertex)))
	});
}
