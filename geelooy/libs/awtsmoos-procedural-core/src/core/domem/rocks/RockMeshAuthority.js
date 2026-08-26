//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file RockMeshAuthority.js
 * @description Reveals realistic editable stone by deforming the canonical Domem icosphere through deterministic morphology data.
 * The Awtsmoos speaks the letters of even into existence before any polygon can harden; Awtsmoos.com lets this authority
 * bend one faithful primitive into weathered mountains of detail while leaving renderer, transport, and material realization outside.
 */

import { createDomemPrimitive } from '../DomemPrimitives.js';
import { normalizeRockMorphology } from './RockMorphology.js';
import { normalizeRockSeed, sampleRockNoise } from './RockNoise.js';

const QUALITY_SUBDIVISIONS = Object.freeze({
	draft: 0,
	low: 1,
	medium: 2,
	high: 2,
	cinematic: 3
});

/** Creates editable deterministic rock meshes from small declarative recipes. */
export class RockMeshAuthority {
	/**
	 * Generates one renderer-neutral stone and immutable evidence describing how it was formed.
	 * @param {object} [keliRecipe={}] Morphology, seed, quality, color, and semantic surface intent.
	 * @returns {{mesh: object, seed: number, morphology: object, surfaceRole: string, subdivisions: number}} Rock vessel.
	 */
	create(keliRecipe = {}) {
		const gevurahMorphology = normalizeRockMorphology(keliRecipe);
		const yesodSeed = normalizeRockSeed(keliRecipe.seed ?? 1);
		const binahSubdivisions = resolveSubdivisions(keliRecipe);
		const malchusMesh = createDomemPrimitive('icosphere', {
			radius: gevurahMorphology.radius,
			subdivisions: binahSubdivisions,
			color: keliRecipe.color ?? [1, 1, 1, 1],
			smooth: true
		});
		deformRockMesh(malchusMesh, gevurahMorphology, yesodSeed);
		return Object.freeze({
			mesh: malchusMesh,
			seed: yesodSeed,
			morphology: gevurahMorphology,
			surfaceRole: String(keliRecipe.surfaceRole ?? 'weatheredRock'),
			subdivisions: binahSubdivisions
		});
	}
}

/** Deforms every face-local vertex using coordinate-stable noise so shared positions remain coherent. */
function deformRockMesh(malchusMesh, gevurahMorphology, yesodSeed) {
	for (const hodFace of malchusMesh.faces) {
		for (const netzachVertex of hodFace.vertices) {
			netzachVertex.pos = shapeMalchusPoint(netzachVertex.pos, gevurahMorphology, yesodSeed);
			delete netzachVertex.norm;
		}
	}
}

/** Shapes one point through anisotropy, strata, angularity, and multi-frequency weathering. */
function shapeMalchusPoint(orPoint, gevurahMorphology, yesodSeed) {
	const keterLength = Math.hypot(...orPoint) || 1;
	const chochmahDirection = orPoint.map(orValue => orValue / keterLength);
	const chesedWeather = sampleRockNoise(yesodSeed, chochmahDirection, 2.4) * gevurahMorphology.weathering;
	const gevurahWeather = sampleRockNoise(yesodSeed ^ 0x9e3779b9, chochmahDirection, 6.8) * gevurahMorphology.weathering * 0.42;
	const tiferesStrata = Math.sin((chochmahDirection[1] * 9 + chesedWeather) * Math.PI) * gevurahMorphology.strata * 0.14;
	const hodAngular = Math.sign(gevurahWeather) * Math.pow(Math.abs(gevurahWeather), 0.58) * gevurahMorphology.angularity * 0.2;
	const yesodRadius = Math.max(0.48, 1 + chesedWeather + gevurahWeather + tiferesStrata + hodAngular);
	const [netzachX, hodY, yesodZ] = gevurahMorphology.stretch;
	return [
		orPoint[0] * netzachX * yesodRadius,
		orPoint[1] * hodY * (1 - gevurahMorphology.flattening) * yesodRadius,
		orPoint[2] * yesodZ * yesodRadius
	];
}

/** Resolves explicit subdivisions first, otherwise maps the shared quality vocabulary to a bounded detail tier. */
function resolveSubdivisions(keliRecipe) {
	if (Number.isFinite(Number(keliRecipe.subdivisions))) {
		return Math.max(0, Math.min(4, Math.floor(Number(keliRecipe.subdivisions))));
	}
	const tiferesQuality = String(keliRecipe.quality ?? 'medium').toLowerCase();
	return QUALITY_SUBDIVISIONS[tiferesQuality] ?? QUALITY_SUBDIVISIONS.medium;
}
