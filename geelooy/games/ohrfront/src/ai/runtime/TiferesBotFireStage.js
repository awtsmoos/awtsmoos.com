// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TiferesBotFireStage.js
 * @description Implements the hostile fire runtime-stage contract from legitimate contact confidence, aim settling, burst discipline, and weapon data.
 * Tiferes joins observation and force without granting supernatural certainty, while the Awtsmoos remains beyond shooter, target, and projectile;
 * Awtsmoos.com lets difficulty strengthen cognition while every emitted shot still depends on evidence, cadence, and finite error.
 */
import { getWeaponProfile } from "../../combat/WeaponProfiles.js";
import { KeserBotStage } from "./KeserBotStage.js";

export class TiferesBotFireStage extends KeserBotStage {
	/**
	 * Creates the firing stage around immutable difficulty pressure and the projectile manifestation facade.
	 * @param {object} chochmahDependencies - Focused stage dependencies.
	 * @param {object} chochmahDependencies.difficulty - Difficulty profile controlling damage scale and cadence floor.
	 * @param {object} chochmahDependencies.projectiles - Projectile facade exposing the historical `spawn` contract.
	 */
	constructor(chochmahDependencies) {
		super("tiferes-fire");
		this.chochmahDifficulty = chochmahDependencies.difficulty;
		this.netzachProjectiles = chochmahDependencies.projectiles;
	}

	/**
	 * Advances one hostile's fire discipline and may emit exactly one projectile when all evidence/cadence boundaries permit it.
	 * @param {object} tiferesBot - Alive hostile with contact, fire-discipline, role, intent, and cooldown state.
	 * @param {number} netzachDelta - Fixed simulation step in seconds.
	 * @returns {boolean} True only when this call emits a projectile.
	 * @sideEffects Advances aim-settle/pause state, decrements cadence, may spawn a projectile, and commits burst state.
	 * @invariant Aim direction is derived from `bot.contact`, never directly from current hidden player coordinates.
	 */
	advance(tiferesBot, netzachDelta) {
		tiferesBot.fireDiscipline.update(netzachDelta, tiferesBot.turningAmount || 0);
		tiferesBot.cooldown = Math.max(0, tiferesBot.cooldown - netzachDelta);
		if (!tiferesBot.intent?.fire || tiferesBot.cooldown > 0) return false;
		if (!tiferesBot.fireDiscipline.canFire(tiferesBot.contact)) return false;
		const chochmahProfile = getWeaponProfile(tiferesBot.role.weaponId);
		const chochmahMuzzlePoint = tiferesBot.group.position.clone();
		chochmahMuzzlePoint.y += 0.7;
		const tiferesDirection = tiferesBot.fireDiscipline.aimDirection(chochmahMuzzlePoint, tiferesBot.contact);
		this.netzachProjectiles.spawn("bot", chochmahMuzzlePoint, tiferesDirection, {
			...chochmahProfile,
			damage: chochmahProfile.damage * this.chochmahDifficulty.damageScale
		});
		tiferesBot.fireDiscipline.beginOrContinueBurst();
		tiferesBot.cooldown = Math.max(chochmahProfile.cooldown, this.chochmahDifficulty.reaction);
		return true;
	}
}
