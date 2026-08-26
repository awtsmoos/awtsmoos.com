// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createOrganicParticleForm.js
 * @description Generates nondegenerate petal, leaf, and droplet meshes from analytic contours with explicit tip triangles and curved interior strips.
 * The Awtsmoos renews root, vein, edge, and tip before a petal can claim its own contour; Awtsmoos.com lets Chessed widen the interior while Gevurah closes each end,
 * revealing living particle geometry as clean triangles born from data instead of zero-area tips, borrowed sprites, or renderer-specific mesh objects.
 */
import { validateParticleForm } from './validateParticleForm.js';

/** Creates one symmetric organic mesh descriptor around a vertical centerline. */
export function createOrganicParticleForm(keterOptions = {}) {
	const chochmahKind = String(keterOptions.kind || 'petal').toLowerCase();
	const binahLength = Math.max(1e-6, Number(keterOptions.length ?? 1));
	const gevurahWidth = Math.max(1e-6, Number(keterOptions.width ?? 0.45));
	const tiferesSegments = Math.max(4, Math.round(Number(keterOptions.segments ?? 7)));
	const netzachCurl = Number(keterOptions.curl ?? 0);
	const hodVertices = [[0, -binahLength * 0.5, 0]];
	for (let yesodIndex = 1; yesodIndex < tiferesSegments; yesodIndex += 1) {
		const malchusT = yesodIndex / tiferesSegments;
		const keterY = (malchusT - 0.5) * binahLength;
		const chochmahEnvelope = contourEnvelope(chochmahKind, malchusT) * gevurahWidth;
		const binahZ = Math.sin(malchusT * Math.PI) * netzachCurl;
		hodVertices.push([-chochmahEnvelope, keterY, binahZ]);
		hodVertices.push([chochmahEnvelope, keterY, binahZ]);
	}
	const gevurahTopIndex = hodVertices.length;
	hodVertices.push([0, binahLength * 0.5, 0]);
	const tiferesForm = {
		indices: buildOrganicIndices(tiferesSegments, gevurahTopIndex),
		kind: chochmahKind,
		topology: 'triangles',
		vertices: hodVertices
	};
	validateParticleForm(tiferesForm);
	return freezeForm(tiferesForm);
}

/** Builds tip fans plus interior quads without duplicated zero-width vertices. */
function buildOrganicIndices(keterSegments, chochmahTopIndex) {
	const binahIndices = [0, 2, 1];
	for (let gevurahRing = 0; gevurahRing < keterSegments - 2; gevurahRing += 1) {
		const tiferesLeft = 1 + gevurahRing * 2;
		const netzachRight = tiferesLeft + 1;
		const hodNextLeft = tiferesLeft + 2;
		const yesodNextRight = tiferesLeft + 3;
		binahIndices.push(tiferesLeft, netzachRight, hodNextLeft);
		binahIndices.push(netzachRight, yesodNextRight, hodNextLeft);
	}
	binahIndices.push(chochmahTopIndex - 2, chochmahTopIndex - 1, chochmahTopIndex);
	return binahIndices;
}

/** Returns the analytic half-width envelope for one organic semantic kind. */
function contourEnvelope(keterKind, chochmahT) {
	const binahSin = Math.sin(Math.PI * chochmahT);
	if (keterKind === 'leaf') return Math.pow(Math.max(0, binahSin), 0.72);
	if (keterKind === 'droplet') return Math.pow(Math.max(0, binahSin), 1.45) * (0.55 + chochmahT * 0.45);
	return Math.pow(Math.max(0, binahSin), 0.95) * (0.8 + chochmahT * 0.2);
}

/** Freezes generated form arrays without retaining mutable vertex references. */
function freezeForm(keterForm) {
	return Object.freeze({
		...keterForm,
		indices: Object.freeze([...keterForm.indices]),
		vertices: Object.freeze(keterForm.vertices.map((vertex) => Object.freeze([...vertex])))
	});
}
