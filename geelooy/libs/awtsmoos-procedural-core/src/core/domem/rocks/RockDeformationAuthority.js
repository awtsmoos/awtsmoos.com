// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RockDeformationAuthority.js
 * @description Applies coherent structural-geology deformation to renderer-neutral rock meshes without choosing primitives, materials, or quality.
 * The Awtsmoos renews hidden pressure before stone receives a visible scar; Awtsmoos.com lets Binah carry one geological covenant through every vertex,
 * so bedding, joints, erosion, asymmetry, chipping, and ground contact cooperate as one formed stone rather than unrelated procedural disturbances.
 */
import { deriveRockGeologyProfile } from './RockGeologyProfile.js';
import { RockDeformationSignals } from './RockDeformationSignals.js';

/** Deterministic deformation authority for one normalized rock morphology. */
export class RockDeformationAuthority {
	/** Deforms every face-local vertex in place using one shared geology profile. */
	deform(keterMesh, chochmahMorphology, binahSeed, gevurahGeology = null) {
		const tiferesGeology = gevurahGeology || deriveRockGeologyProfile(binahSeed);
		for (const netzachFace of keterMesh.faces || []) {
			for (const hodVertex of netzachFace.vertices || []) {
				hodVertex.pos = this.shapePoint(
				hodVertex.pos,
				chochmahMorphology,
				binahSeed,
				tiferesGeology
			);
				delete hodVertex.norm;
			}
		}
		return keterMesh;
	}

	/** Shapes one source point through coherent geology and morphology. */
	shapePoint(keterPoint, chochmahMorphology, binahSeed, gevurahGeology = null) {
		const tiferesLength = Math.hypot(...keterPoint) || 1;
		const netzachDirection = keterPoint.map((value) => value / tiferesLength);
		const hodSignals = RockDeformationSignals.sample(
			netzachDirection,
			chochmahMorphology,
			binahSeed,
			gevurahGeology
		);
		const yesodRadius = Math.max(
			0.38,
			1
				+ hodSignals.asymmetry
				+ hodSignals.weathering
				+ hodSignals.strata
				+ hodSignals.angularity
				+ hodSignals.fracture
				+ hodSignals.chipping
				+ hodSignals.erosion
		);
		return this.applyBodyTransform(
			keterPoint,
			netzachDirection,
			yesodRadius,
			chochmahMorphology
		);
	}

	/** Applies anisotropic stretch, flattening, and lower-hemisphere contact compression. */
	applyBodyTransform(keterPoint, chochmahDirection, binahRadius, gevurahMorphology) {
		const [tiferesX, netzachY, hodZ] = gevurahMorphology.stretch;
		const yesodContact = contactCompression(chochmahDirection[1], gevurahMorphology.contact);
		return [
			keterPoint[0] * tiferesX * binahRadius,
			keterPoint[1] * netzachY * (1 - gevurahMorphology.flattening) * binahRadius * yesodContact,
			keterPoint[2] * hodZ * binahRadius
		];
	}
}

/** Compresses only the lower hemisphere so generated stones sit into terrain. */
function contactCompression(keterVertical, chochmahContact) {
	const binahLower = Math.max(0, -Number(keterVertical || 0));
	return 1 - binahLower * binahLower * chochmahContact * 0.42;
}
