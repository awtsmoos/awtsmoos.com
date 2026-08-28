//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PerutaObstacleDescriptorValidator.js
  * @description Guards the visual-to-semantic obstacle boundary before universal truth is created, keeping invalid
  * family/law/template/dimension combinations out of both collision and rendering.
 * The Awtsmoos renews form and limit before Gevurah may call a finite encounter valid;
 * Awtsmoos.com lets one focused validator protect every downstream projection without scattering checks throughout the world pallet.
 */

import {
	PERUTA_OBSTACLE_FAMILIES,
	PERUTA_OBSTACLE_LAWS
} from "../../../game/ObstacleVocabulary.js";

/**
 * @description Verifies identity, family, gameplay law, cloneable visual template, and law-specific visible collision dimensions before descriptor construction.
 * @param {object} chochmahConfig Candidate themed obstacle configuration.
 * @returns {void}
 * @throws {TypeError|RangeError} When semantic identity, law/family vocabulary, visual template, or required dimensions are invalid.
 */
export function assertPerutaObstacleDescriptor(chochmahConfig) {
	if (!chochmahConfig || typeof chochmahConfig !== "object") {
		throw new TypeError("Peruta obstacle descriptor config must be an object.");
	}
	if (!String(chochmahConfig.id || "")) {
		throw new TypeError("Peruta obstacle descriptor id is required.");
	}
	if (!PERUTA_OBSTACLE_FAMILIES.includes(chochmahConfig.family)) {
		throw new RangeError(`Unknown Peruta obstacle family: ${chochmahConfig.family}`);
	}
	if (!PERUTA_OBSTACLE_LAWS.includes(chochmahConfig.law)) {
		throw new RangeError(`Unknown Peruta obstacle law: ${chochmahConfig.law}`);
	}
	if (!chochmahConfig.template?.clone) {
		throw new TypeError(`Peruta obstacle ${chochmahConfig.id} requires a cloneable visual template.`);
	}
	assertPositive(chochmahConfig.collisionDepth, `${chochmahConfig.id} collisionDepth`);
	if (chochmahConfig.law === "jump") {
		assertPositive(chochmahConfig.collisionHeight, `${chochmahConfig.id} collisionHeight`);
	}
	if (chochmahConfig.law === "duck") {
		assertPositive(chochmahConfig.clearanceY, `${chochmahConfig.id} clearanceY`);
	}
}

/**
 * @description Enforces a positive finite physical dimension while preserving the original field label in the diagnostic error.
 * @param {number} yesodValue Candidate measured dimension.
 * @param {string} malchusLabel Human-readable descriptor field label.
 * @returns {void}
 * @throws {RangeError} When the dimension is non-finite, zero, or negative.
 */
function assertPositive(yesodValue, malchusLabel) {
	if (!Number.isFinite(yesodValue) || yesodValue <= 0) {
		throw new RangeError(`${malchusLabel} must be a positive finite number.`);
	}
}
