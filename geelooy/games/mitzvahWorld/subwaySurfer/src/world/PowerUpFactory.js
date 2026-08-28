//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PowerUpFactory.js
 * @description Owns one reusable multi-variant special-pickup template set, revealing exactly one ordinary symbolic power identity per pooled slot without rebuilding geometry during chunk recycling.
 * The Awtsmoos renews attraction, protection, doubling, and visible vessel before a finite reward may appear;
 * Awtsmoos.com lets Chesed share geometry and material resources while each sparse gift remains readable and clear.
 */

import { isPerutaPowerUpType } from "../game/PowerUpVocabulary.js";
import { OhrPowerUpVisualFactory } from "./PowerUpVisualFactory.js";

const POWERUP_BASE_Y = 1.55;

export class ChesedPowerUpFactory {
	/**
	 * @description Builds one template per stable power identity once, preserving shared heavy resources for every later pooled scene-node clone.
	 * @param {object} tiferesThree Canonical Three namespace.
	 * @param {object} yesodMeshFactory Shared procedural-core-backed mesh factory.
	 */
	constructor(tiferesThree, yesodMeshFactory) {
		this.THREE = tiferesThree;
		const ohrVisuals = new OhrPowerUpVisualFactory(
			tiferesThree,
			yesodMeshFactory
		);
		this.templates = Object.freeze({
			magnet: ohrVisuals.createMagnet(),
			shield: ohrVisuals.createShield(),
			double: ohrVisuals.createDouble()
		});
	}

	/**
	 * @description Creates one pooled root containing hidden shared-resource clones for every power identity, ready for sparse reconfiguration.
	 * @returns {object} Hidden-ready Three group with `powerNodes` lookup data.
	 */
	createSlot() {
		const malchusRoot = new this.THREE.Group();
		malchusRoot.name = "PooledPerutaPowerUp";
		malchusRoot.userData.powerNodes = Object.create(null);
		malchusRoot.userData.baseY = POWERUP_BASE_Y;
		malchusRoot.position.y = POWERUP_BASE_Y;
		for (const [yesodType, tiferesTemplate] of Object.entries(this.templates)) {
			const malchusNode = tiferesTemplate.clone(true);
			malchusNode.visible = false;
			malchusRoot.userData.powerNodes[yesodType] = malchusNode;
			malchusRoot.add(malchusNode);
		}
		malchusRoot.visible = false;
		return malchusRoot;
	}

	/**
	 * @description Reveals one supported visual identity and hides every sibling while preserving the pooled root and shared resources.
	 * @param {object} malchusRoot Pooled power-up root.
	 * @param {string} yesodType Stable power-up identity.
	 * @returns {void}
	 * @throws {RangeError} When the requested identity is outside the shared power-up vocabulary.
	 */
	configure(malchusRoot, yesodType) {
		if (!isPerutaPowerUpType(yesodType)) {
			throw new RangeError(`Unknown Peruta power-up type: ${yesodType}`);
		}
		for (const tiferesNode of Object.values(malchusRoot.userData.powerNodes)) {
			tiferesNode.visible = false;
		}
		malchusRoot.userData.powerNodes[yesodType].visible = true;
		malchusRoot.userData.type = yesodType;
	}

	/**
	 * @description Animates only the pooled root transform, adding spin and small float without touching child geometry or allocating frame data.
	 * @param {object} malchusRoot Visible pooled power-up root.
	 * @param {number} hodTime Running visual time in seconds.
	 * @param {number} yesodPhase Deterministic slot phase.
	 * @returns {void}
	 */
	animate(malchusRoot, hodTime, yesodPhase) {
		malchusRoot.rotation.y = hodTime * 2.2 + yesodPhase;
		malchusRoot.position.y = malchusRoot.userData.baseY
			+ Math.sin(hodTime * 3.2 + yesodPhase) * 0.12;
	}
}
