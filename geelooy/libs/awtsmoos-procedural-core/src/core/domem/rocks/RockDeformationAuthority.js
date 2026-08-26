// B"H
// Boruch Hashem
// Blessed is He

import { RockDeformationSignals } from './RockDeformationSignals.js';

/**
 * @file RockDeformationAuthority.js
 * @description Owns deterministic rock-point deformation and ground-contact shaping without creating primitives or choosing quality.
 * The Awtsmoos renews hidden pressure before stone receives a visible scar; Awtsmoos.com lets Binah transform pure geological
 * signals into finite points while mesh construction, materials, placement, and public API remain in their own ordered vessels.
 */
export class RockDeformationAuthority {
	/**
	 * Deforms every face-local vertex of one renderer-neutral rock mesh in place.
	 * @param {object} malchusMesh Mutable Domem primitive mesh.
	 * @param {object} gevurahMorphology Normalized morphology covenant.
	 * @param {number} yesodSeed Deterministic unsigned seed.
	 * @returns {object} The same mesh reference after deterministic deformation.
	 */
	deform(malchusMesh, gevurahMorphology, yesodSeed) {
		for (const hodFace of malchusMesh.faces || []) {
			for (const netzachVertex of hodFace.vertices || []) {
				netzachVertex.pos = this.shapePoint(
					netzachVertex.pos,
					gevurahMorphology,
					yesodSeed
				);
				delete netzachVertex.norm;
			}
		}
		return malchusMesh;
	}

	/**
	 * Shapes one source point using anisotropy, layered noise, fractures, chips, erosion, and grounded compression.
	 * @param {number[]} orPoint Source point from the canonical primitive.
	 * @param {object} gevurahMorphology Normalized geological morphology.
	 * @param {number} yesodSeed Deterministic rock seed.
	 * @returns {number[]} New world-local deformed point.
	 */
	shapePoint(orPoint, gevurahMorphology, yesodSeed) {
		const keterLength = Math.hypot(...orPoint) || 1;
		const chochmahDirection = orPoint.map((orValue) => orValue / keterLength);
		const tiferesSignals = RockDeformationSignals.sample(
			chochmahDirection,
			gevurahMorphology,
			yesodSeed
		);
		const yesodRadius = Math.max(
			0.38,
			1
				+ tiferesSignals.asymmetry
				+ tiferesSignals.weathering
				+ tiferesSignals.strata
				+ tiferesSignals.angularity
				+ tiferesSignals.fracture
				+ tiferesSignals.chipping
				+ tiferesSignals.erosion
		);
		return this.applyBodyTransform(
			orPoint,
			chochmahDirection,
			yesodRadius,
			gevurahMorphology
		);
	}

	/**
	 * Applies anisotropic stretch, overall flattening, and bottom-biased contact compression.
	 * @param {number[]} orPoint Original primitive point.
	 * @param {number[]} chochmahDirection Normalized source direction.
	 * @param {number} yesodRadius Radial geological displacement multiplier.
	 * @param {object} gevurahMorphology Normalized morphology.
	 * @returns {number[]} Final deformed point.
	 */
	applyBodyTransform(orPoint, chochmahDirection, yesodRadius, gevurahMorphology) {
		const [netzachX, hodY, yesodZ] = gevurahMorphology.stretch;
		const malchusContact = contactCompression(
			chochmahDirection[1],
			gevurahMorphology.contact
		);
		return [
			orPoint[0] * netzachX * yesodRadius,
			orPoint[1]
				* hodY
				* (1 - gevurahMorphology.flattening)
				* yesodRadius
				* malchusContact,
			orPoint[2] * yesodZ * yesodRadius
		];
	}
}

/**
 * Compresses only the lower hemisphere so generated stones sit into terrain instead of balancing on a perfect sphere point.
 * @param {number} gevurahVertical Normalized vertical direction.
 * @param {number} chesedContact Contact intensity between zero and one.
 * @returns {number} Multiplicative vertical compression factor.
 */
function contactCompression(gevurahVertical, chesedContact) {
	const malchusLower = Math.max(0, -Number(gevurahVertical || 0));
	return 1 - malchusLower * malchusLower * chesedContact * 0.42;
}
