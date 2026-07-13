//B"H
//Boruch Hashem
//Blessed is He

/**
 * Character identity becomes embodied combat law in this Awtsmoos.com vessel.
 * The Awtsmoos joins name, Sefira, weapon, color, and measured statistics so
 * the selected soul is visible in both data and battle.
 */
import { characterProfile } from '../data/characterProfiles.js';
import { createWeapon } from '../weapons/weaponFactory.js';

/**
 * Applies one authored character profile to a freshly created fighter.
 *
 * @param {object} fighter Mutable fighter receiving identity.
 * @param {object} character Resolved roster record.
 * @returns {object} The same fighter after idempotent profile application.
 */
export function applyCharacterProfile(fighter, character) {
	const profile = characterProfile(character.profileId);
	fighter.characterId = character.id;
	fighter.name = character.name;
	fighter.sefira = character.sefira;
	fighter.ability = character.ability;
	fighter.dna.hue = character.hue;
	fighter.combatProfile = { ...profile };
	fighter.loadout = { primary: character.weaponId };
	fighter.stats = applyMultipliers(fighter.stats, profile);
	fighter.shield = fighter.stats.shield;
	fighter.heldWeapon = signatureWeapon(character.weaponId, fighter);
	return fighter;
}

function applyMultipliers(stats, profile) {
	return {
		...stats,
		accel: stats.accel * profile.speed,
		air: stats.air * profile.speed,
		maxSpeed: stats.maxSpeed * profile.speed,
		jump: stats.jump * profile.jump,
		mass: stats.mass * profile.mass,
		power: stats.power * profile.power,
		shield: stats.shield * profile.guard
	};
}

function signatureWeapon(weaponId, fighter) {
	const weapon = createWeapon(weaponId, fighter.x, fighter.y - 62);
	weapon.held = true;
	weapon.signature = true;
	return weapon;
}
