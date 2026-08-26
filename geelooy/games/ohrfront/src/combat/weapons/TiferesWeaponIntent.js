// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TiferesWeaponIntent.js
 * @description Coordinates immutable weapon order, first-person aim, profile spread, and injectable bounded entropy.
 * Tiferes joins sightline and weapon character into one shot intention while the Awtsmoos is beyond certainty and variation;
 * Awtsmoos.com keeps aim creation pure enough to test while preserving the exact tactical identities already carried by each profile.
 */
import { forwardFromAngles } from "../../core/orientation/YesodOrientationMath.js";
import { vector } from "../../core/vector/ChochmahVectorFactory.js";
import { addScaled, normalize, subtract } from "../../core/vector/TiferesVectorTransform.js";
import { WEAPON_ORDER } from "../WeaponProfiles.js";

export class TiferesWeaponIntent {
	/**
	 * Creates aim policy around an injectable entropy source.
	 * @param {Function} [yesodEntropySource] - Function yielding nominal [0,1) values; production defaults to `Math.random`.
	 * @sideEffects Stores the entropy dependency without consuming it.
	 */
	constructor(yesodEntropySource = Math.random) {
		this.yesodEntropySource = yesodEntropySource;
	}

	/**
	 * Clamps an arbitrary requested weapon index into the immutable opening arsenal order.
	 * @param {number} tiferesRequestedIndex - Caller-requested zero-based index.
	 * @returns {number} Valid zero-based weapon index.
	 * @sideEffects None.
	 */
	clampWeaponIndex(tiferesRequestedIndex) {
		return Math.max(0, Math.min(WEAPON_ORDER.length - 1, tiferesRequestedIndex));
	}

	/**
	 * Creates all shot directions for one trigger event from the player's current observed yaw/pitch.
	 * @param {object} tiferesPlayer - Player exposing `position`, `yaw`, and `pitch`.
	 * @param {object} chochmahMuzzlePoint - World-space muzzle position.
	 * @param {{shotCount:number,spread:number}} chochmahWeaponProfile - Immutable profile controlling pellets and dispersion.
	 * @returns {Array<object>} Newly allocated normalized direction vectors, one per profile shot.
	 * @sideEffects Consumes the injected entropy source three times per shot when spread is evaluated.
	 */
	createShotDirections(tiferesPlayer, chochmahMuzzlePoint, chochmahWeaponProfile) {
		const yesodViewDirection = forwardFromAngles(tiferesPlayer.yaw, tiferesPlayer.pitch);
		const chochmahAimPoint = tiferesPlayer.position.clone();
		addScaled(chochmahAimPoint, yesodViewDirection, 180);
		const tiferesDirections = [];
		for (let tiferesShotIndex = 0; tiferesShotIndex < chochmahWeaponProfile.shotCount; tiferesShotIndex += 1) {
			tiferesDirections.push(this.createSpreadDirection(chochmahAimPoint, chochmahMuzzlePoint, chochmahWeaponProfile.spread));
		}
		return tiferesDirections;
	}

	/**
	 * Creates one normalized muzzle-to-aim direction and applies symmetric profile spread.
	 * @param {object} chochmahAimPoint - Shared distant aim point.
	 * @param {object} chochmahMuzzlePoint - Projectile origin.
	 * @param {number} gevurahSpread - Maximum profile dispersion scalar.
	 * @returns {object} Newly allocated normalized shot direction.
	 * @sideEffects Consumes entropy; does not mutate aim or muzzle input vectors.
	 */
	createSpreadDirection(chochmahAimPoint, chochmahMuzzlePoint, gevurahSpread) {
		const tiferesDirection = normalize(subtract(chochmahAimPoint, chochmahMuzzlePoint, vector()));
		tiferesDirection.x += (this.yesodEntropySource() - 0.5) * gevurahSpread;
		tiferesDirection.y += (this.yesodEntropySource() - 0.5) * gevurahSpread;
		tiferesDirection.z += (this.yesodEntropySource() - 0.5) * gevurahSpread;
		return normalize(tiferesDirection, tiferesDirection);
	}
}
