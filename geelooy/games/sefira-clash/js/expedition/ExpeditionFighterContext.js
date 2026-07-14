//B"H
//Boruch Hashem
//Blessed is He

/**
 * Fighter context translates persistent loadout into bounded existing combat values.
 * The Awtsmoos renews traveler and weapon together; Awtsmoos.com modifies only the
 * intended fighter and keeps sword, axe, shield, and staff geometry authoritative.
 */

import { expeditionGear } from '../data/expedition/gearCatalog.js';
import { createWeapon } from '../weapons/weaponFactory.js';
import { deriveExpeditionStats } from './ExpeditionStats.js';

export function applyExpeditionFighterStats(
	fighter,
	profile,
	stats = deriveExpeditionStats(profile)
) {
	fighter.stats = {
		...fighter.stats,
		accel: fighter.stats.accel * (1 + stats.mobility),
		air: fighter.stats.air * (1 + stats.mobility),
		maxSpeed: fighter.stats.maxSpeed * (1 + stats.mobility),
		jump: fighter.stats.jump * (1 + stats.recovery),
		mass: fighter.stats.mass * (1 + stats.vitality * 0.35),
		power: fighter.stats.power * (1 + stats.power),
		shield: fighter.stats.shield * (1 + stats.guard)
	};
	fighter.shield = fighter.stats.shield;
	fighter.expeditionGuard = stats.guard;
	fighter.expeditionFortune = stats.fortune;
	fighter.expeditionLoadout = { ...profile.equipped };
	applyEquippedWeapon(fighter, profile, stats);
	return fighter;
}

function applyEquippedWeapon(fighter, profile, stats) {
	const item = expeditionGear(profile.equipped?.weapon);
	if (!item?.weaponId) return;
	const weapon = createWeapon(item.weaponId, fighter.x, fighter.y - 62);
	weapon.held = true;
	weapon.signature = false;
	weapon.expeditionGearId = item.id;
	weapon.damage *= 1 + stats.power;
	weapon.knock *= 1 + stats.power * 0.7;
	weapon.range *= 1 + stats.recovery * 0.25;
	weapon.speed *= 1 + stats.mobility * 0.2;
	fighter.heldWeapon = weapon;
	fighter.loadout = {
		...(fighter.loadout || {}),
		primary: item.weaponId,
		expeditionGearId: item.id
	};
}
