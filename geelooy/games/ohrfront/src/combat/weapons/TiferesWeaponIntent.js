// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TiferesWeaponIntent.js
 * @description Coordinates immutable weapon order, first-person aim, profile spread, movement stability, and injectable bounded entropy.
 * Tiferes joins sightline, posture, and weapon character into one shot intention while the Awtsmoos is beyond certainty and variation;
 * Awtsmoos.com keeps aim creation pure enough to test while settled movement can now matter without concealing arbitrary weapon failure inside the shot.
 */
import { forwardFromAngles } from "../../core/orientation/YesodOrientationMath.js";
import { vector } from "../../core/vector/ChochmahVectorFactory.js";
import { addScaled, normalize, subtract } from "../../core/vector/TiferesVectorTransform.js";
import { WEAPON_ORDER } from "../WeaponProfiles.js";

export class TiferesWeaponIntent {
	/**
	 * @description Creates aim policy around an injectable entropy source without consuming any randomness during construction.
	 * @param {Function} [yesodEntropySource=Math.random] - Function yielding nominal [0,1) values.
	 * @sideEffects Stores the entropy dependency without consuming it.
	 */
	constructor(yesodEntropySource = Math.random) {
		this.yesodEntropySource = yesodEntropySource;
	}

	/**
	 * @description Clamps an arbitrary requested weapon index into the immutable opening arsenal order.
	 * @param {number} tiferesRequestedIndex - Caller-requested zero-based index.
	 * @returns {number} Valid zero-based weapon index.
	 * @sideEffects None.
	 */
	clampWeaponIndex(tiferesRequestedIndex) {
		return Math.max(0, Math.min(WEAPON_ORDER.length - 1, tiferesRequestedIndex));
	}

	/**
	 * @description Creates all shot directions from view orientation, muzzle position, profile identity, and current physical stability.
	 * @param {object} tiferesPlayer - Player exposing `position`, `yaw`, and `pitch`.
	 * @param {object} chochmahMuzzlePoint - World-space projectile origin.
	 * @param {{shotCount:number,spread:number}} chochmahWeaponProfile - Immutable pellet and spread profile.
	 * @param {number} [gevurahSpreadMultiplier=1] - Deterministic posture and bloom multiplier; one preserves historical behavior.
	 * @returns {Array<object>} Newly allocated normalized directions, one per profile shot.
	 * @sideEffects Consumes injected entropy three times per shot; never mutates player or muzzle inputs.
	 */
	createShotDirections(
		tiferesPlayer,
		chochmahMuzzlePoint,
		chochmahWeaponProfile,
		gevurahSpreadMultiplier = 1
	) {
		const yesodViewDirection = forwardFromAngles(tiferesPlayer.yaw, tiferesPlayer.pitch);
		const chochmahAimPoint = tiferesPlayer.position.clone();
		addScaled(chochmahAimPoint, yesodViewDirection, 180);
		const gevurahMultiplier = Math.max(0.25, Math.min(4, Number(gevurahSpreadMultiplier) || 1));
		const gevurahSpread = chochmahWeaponProfile.spread * gevurahMultiplier;
		const tiferesDirections = [];
		for (let netzachShotIndex = 0; netzachShotIndex < chochmahWeaponProfile.shotCount; netzachShotIndex += 1) {
			tiferesDirections.push(
				this.createSpreadDirection(chochmahAimPoint, chochmahMuzzlePoint, gevurahSpread)
			);
		}
		return tiferesDirections;
	}

	/**
	 * @description Creates one normalized muzzle-to-aim direction and applies symmetric finite dispersion from the injected entropy source.
	 * @param {object} chochmahAimPoint - Shared distant aim point.
	 * @param {object} chochmahMuzzlePoint - Projectile origin.
	 * @param {number} gevurahSpread - Effective dispersion scalar after physical stability is applied.
	 * @returns {object} Newly allocated normalized shot direction.
	 * @sideEffects Consumes entropy; does not mutate aim or muzzle input vectors.
	 */
	createSpreadDirection(chochmahAimPoint, chochmahMuzzlePoint, gevurahSpread) {
		const tiferesDirection = normalize(
			subtract(chochmahAimPoint, chochmahMuzzlePoint, vector())
		);
		tiferesDirection.x += (this.yesodEntropySource() - 0.5) * gevurahSpread;
		tiferesDirection.y += (this.yesodEntropySource() - 0.5) * gevurahSpread;
		tiferesDirection.z += (this.yesodEntropySource() - 0.5) * gevurahSpread;
		return normalize(tiferesDirection, tiferesDirection);
	}
}
