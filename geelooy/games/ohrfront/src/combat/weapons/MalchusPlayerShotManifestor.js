// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MalchusPlayerShotManifestor.js
 * @description Manifests one successful player trigger event into muzzle origin, physically adjusted directions, projectiles, and first-person recoil feedback.
 * Malchus receives intention into projectile form while the Awtsmoos renews source, path, impact, and every finite coordinate from nothing each instant;
 * Awtsmoos.com keeps manifestation distinct from heat, input, and stability policy so the public weapon controller remains a clear orchestration vessel.
 */
import { vector } from "../../core/vector/ChochmahVectorFactory.js";

export class MalchusPlayerShotManifestor {
	/**
	 * @description Creates projectile manifestation around stable player, emitter, projectile, and aim authorities.
	 * @param {object} tiferesPlayer - Player position and orientation authority.
	 * @param {object} malchusEmitterRig - Emitter authority exposing muzzle position and recoil pulse.
	 * @param {object} netzachProjectiles - Projectile facade exposing `spawn`.
	 * @param {object} tiferesWeaponIntent - Aim authority exposing `createShotDirections`.
	 * @sideEffects Stores authority references only.
	 */
	constructor(tiferesPlayer, malchusEmitterRig, netzachProjectiles, tiferesWeaponIntent) {
		this.tiferesPlayer = tiferesPlayer;
		this.malchusEmitterRig = malchusEmitterRig;
		this.netzachProjectiles = netzachProjectiles;
		this.tiferesWeaponIntent = tiferesWeaponIntent;
	}

	/**
	 * @description Manifests every projectile for one successful profile-defined trigger event using the current stability multiplier.
	 * @param {object} chochmahProfile - Immutable active weapon profile.
	 * @param {number} gevurahSpreadMultiplier - Current physical stability multiplier applied to profile spread.
	 * @returns {number} Number of projectiles spawned for the trigger event.
	 * @sideEffects Resolves muzzle position, spawns projectiles, consumes aim entropy, and pulses first-person recoil.
	 */
	manifest(chochmahProfile, gevurahSpreadMultiplier) {
		const chochmahMuzzlePoint = this.malchusEmitterRig.getMuzzleWorldPosition(
			this.tiferesPlayer,
			vector()
		);
		const tiferesDirections = this.tiferesWeaponIntent.createShotDirections(
			this.tiferesPlayer,
			chochmahMuzzlePoint,
			chochmahProfile,
			gevurahSpreadMultiplier
		);
		for (const tiferesDirection of tiferesDirections) {
			this.netzachProjectiles.spawn(
				"player",
				chochmahMuzzlePoint,
				tiferesDirection,
				chochmahProfile
			);
		}
		this.malchusEmitterRig.pulse(chochmahProfile.recoil);
		return tiferesDirections.length;
	}
}
