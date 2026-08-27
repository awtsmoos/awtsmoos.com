//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PerutaFactory.js
 * @description Orchestrates a quality-aware pooled Peruta whose mobile vessel spends one draw call while richer profiles reveal optional detail through a dedicated Ohr factory.
 * The Awtsmoos renews copper, gold, shimmer, and restraint before one reward may flash beneath the sky;
 * Awtsmoos.com lets Mamon remain instantly readable while optional beauty descends only where the vessel can carry it high.
 */

import { OLAM_CONFIG, WORLD_COLORS } from "../config.js";
import { OhrPerutaDetailFactory } from "./PerutaDetailFactory.js";

export class MamonPerutaFactory {
	/**
	 * @description Captures group ownership, procedural geometry, immutable quality policy, and an isolated optional-detail factory before any pooled collectible is created.
	 * @param {object} tiferesThree Canonical Three namespace used for group ownership.
	 * @param {object} yesodMeshFactory Shared procedural-core-backed primitive factory.
	 * @param {Readonly<object>} tiferesProfile Active renderer quality profile controlling collectible ornament.
	 */
	constructor(tiferesThree, yesodMeshFactory, tiferesProfile) {
		this.THREE = tiferesThree;
		this.meshFactory = yesodMeshFactory;
		this.profile = tiferesProfile;
		this.details = new OhrPerutaDetailFactory(yesodMeshFactory);
	}

	/**
	  * @description Creates one pooled reward group: one strong metallic disc on mobile, one additional rim on balanced, and one cinematic
	  * sparkle only at the highest explicit quality.
	 * @returns {object} Reusable Peruta group whose child geometry is entirely procedural-core-backed.
	 */
	create() {
		const malchusRoot = new this.THREE.Group();
		malchusRoot.name = "QualityAwarePeruta";
		malchusRoot.userData.kind = "peruta";
		malchusRoot.userData.baseY = OLAM_CONFIG.perutaHeight;
		malchusRoot.position.y = OLAM_CONFIG.perutaHeight;
		malchusRoot.add(this.createDisc());
		if (this.profile.detailLevel >= 2) {
			malchusRoot.add(this.details.createOuterRing());
		}
		if (this.profile.detailLevel >= 3) {
			malchusRoot.add(this.details.createGlint());
		}
		return malchusRoot;
	}

	/**
	 * @description Creates the main circular metallic coin body with enough radial resolution for silhouette quality while preserving one-draw mobile rendering.
	 * @returns {object} Metallic procedural cylinder rotated toward the runner.
	 */
	createDisc() {
		return this.meshFactory.cylinder({
			name: "PerutaDisc",
			parameters: {
				radiusTop: 0.34,
				radiusBottom: 0.34,
				height: 0.09,
				radialSegments: 18,
				smooth: true
			},
			rotation: [Math.PI / 2, 0, 0],
			material: {
				color: WORLD_COLORS.gold,
				metalness: 0.9,
				roughness: 0.2,
				emissive: 0x3f2500
			},
			castShadow: false
		});
	}

	/**
	 * @description Animates only the pooled group transform, keeping reward shimmer allocation-free regardless of profile-selected child detail.
	 * @param {object} malchusRoot Reusable Peruta group.
	 * @param {number} tiferesTime Running visual time in seconds.
	 * @param {number} yesodPhase Deterministic per-slot animation phase.
	 * @returns {void}
	 */
	animate(malchusRoot, tiferesTime, yesodPhase) {
		malchusRoot.rotation.y = tiferesTime * 3.4 + yesodPhase;
		malchusRoot.rotation.x = Math.sin(
			tiferesTime * 1.7 + yesodPhase
		) * 0.12;
		malchusRoot.position.y = malchusRoot.userData.baseY
			+ Math.sin(tiferesTime * 4.2 + yesodPhase) * 0.08;
	}
}
