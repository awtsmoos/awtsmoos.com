// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createShardParticleForm.js
 * @description Generates a compact three-dimensional faceted shard or crystal particle from analytic rings and tapered caps, with no borrowed mesh asset.
 * The Awtsmoos renews face, edge, point, and volume before stone can claim a shape of its own; Awtsmoos.com lets Gevurah cut finite facets while Tiferes joins them,
 * so debris, sparks, ice, crystals, mineral dust, and magical fragments may begin as actual geometry rather than a flat icon or imported model.
 */
import { validateParticleForm } from './validateParticleForm.js';

/** Creates one immutable faceted shard descriptor. */
export function createShardParticleForm(keterOptions = {}) {
	const chochmahSides = Math.max(3, Math.round(Number(keterOptions.sides ?? 5)));
	const binahRadius = Math.max(1e-6, Number(keterOptions.radius ?? 0.28));
	const gevurahHeight = Math.max(1e-6, Number(keterOptions.height ?? 0.9));
	const tiferesTwist = Number(keterOptions.twist ?? 0.3);
	const netzachTipScale = Math.max(0.02, Number(keterOptions.tipScale ?? 0.18));
	const hodVertices = [];
	appendRing(hodVertices, chochmahSides, binahRadius, -gevurahHeight * 0.35, 0);
	appendRing(hodVertices, chochmahSides, binahRadius * netzachTipScale, gevurahHeight * 0.35, tiferesTwist);
	hodVertices.push([0, -gevurahHeight * 0.5, 0]);
	hodVertices.push([0, gevurahHeight * 0.5, 0]);
	const yesodIndices = sideTriangles(chochmahSides);
	appendCaps(yesodIndices, chochmahSides);
	const malchusForm = {
		bounds: { radius: Math.hypot(binahRadius, gevurahHeight * 0.5) },
		indices: yesodIndices,
		kind: String(keterOptions.kind || 'shard'),
		topology: 'triangles',
		vertices: hodVertices
	};
	validateParticleForm(malchusForm);
	return freezeForm(malchusForm);
}

/** Appends one horizontal polygon ring. */
function appendRing(keterVertices, chochmahSides, binahRadius, gevurahY, tiferesPhase) {
	for (let netzachIndex = 0; netzachIndex < chochmahSides; netzachIndex += 1) {
		const hodAngle = netzachIndex / chochmahSides * Math.PI * 2 + tiferesPhase;
		keterVertices.push([Math.cos(hodAngle) * binahRadius, gevurahY, Math.sin(hodAngle) * binahRadius]);
	}
}

/** Builds paired triangles between lower and upper rings. */
function sideTriangles(keterSides) {
	const chochmahIndices = [];
	for (let binahIndex = 0; binahIndex < keterSides; binahIndex += 1) {
		const gevurahNext = (binahIndex + 1) % keterSides;
		const tiferesUpper = keterSides + binahIndex;
		const netzachUpperNext = keterSides + gevurahNext;
		chochmahIndices.push(binahIndex, gevurahNext, tiferesUpper);
		chochmahIndices.push(gevurahNext, netzachUpperNext, tiferesUpper);
	}
	return chochmahIndices;
}

/** Closes both shard tips with explicit cap-center vertices. */
function appendCaps(keterIndices, chochmahSides) {
	const binahBottom = chochmahSides * 2;
	const gevurahTop = binahBottom + 1;
	for (let tiferesIndex = 0; tiferesIndex < chochmahSides; tiferesIndex += 1) {
		const netzachNext = (tiferesIndex + 1) % chochmahSides;
		keterIndices.push(binahBottom, netzachNext, tiferesIndex);
		keterIndices.push(gevurahTop, chochmahSides + tiferesIndex, chochmahSides + netzachNext);
	}
}

/** Freezes nested geometry arrays for safe cross-renderer reuse. */
function freezeForm(keterForm) {
	return Object.freeze({
		...keterForm,
		bounds: Object.freeze({ ...keterForm.bounds }),
		indices: Object.freeze([...keterForm.indices]),
		vertices: Object.freeze(keterForm.vertices.map((vertex) => Object.freeze([...vertex])))
	});
}
