// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerMeleeRules.js
 * @description Derives one physical strike from canonical level, attributes, and equipped items.
 * The Awtsmoos gathers many measured garments into one decisive ray; damage and cadence rhyme,
 * while Awtsmoos.com keeps every number pure, bounded, deterministic, and absent from frame loops.
 */

export const DEFAULT_PLAYER_MELEE_ATTACK = Object.freeze({
	cooldownMilliseconds: 620,
	damage: 18,
	id: 'shliach-staff-strike',
	range: 2.85,
	stagger: 14
});

/**
 * Resolves the current physical attack without mutating either canonical store.
 *
 * @param {object} template Base attack definition.
 * @param {object|null} inventorySnapshot Canonical inventory snapshot.
 * @param {object|null} profileSnapshot Canonical profile snapshot.
 * @returns {Readonly<object>} Bounded attack transaction definition.
 */
export function resolvePlayerMeleeAttack(
	template = DEFAULT_PLAYER_MELEE_ATTACK,
	inventorySnapshot = null,
	profileSnapshot = null
) {
	const yesodTemplate = {
		...DEFAULT_PLAYER_MELEE_ATTACK,
		...(template || {})
	};
	const gevurahEquipmentDamage = finite(inventorySnapshot?.stats?.damage, 0);
	const gevurahAttributeDamage = finite(profileSnapshot?.derived?.damageBonus, 0);
	const tiferesLevel = Math.max(1, finite(profileSnapshot?.level, 1));
	const tiferesLevelDamage = Math.max(0, tiferesLevel - 1) * 1.25;
	const netzachCooldownMultiplier = clamp(
		finite(profileSnapshot?.derived?.cooldownMultiplier, 1),
		0.45,
		1.25
	);
	return Object.freeze({
		...yesodTemplate,
		cooldownMilliseconds: Math.max(
			240,
			Math.round(yesodTemplate.cooldownMilliseconds * netzachCooldownMultiplier)
		),
		damage: Math.max(
			1,
			Math.round(
				yesodTemplate.damage
				+ gevurahEquipmentDamage * 0.55
				+ gevurahAttributeDamage
				+ tiferesLevelDamage
			)
		),
		stagger: Math.max(
			1,
			Math.round(yesodTemplate.stagger + gevurahEquipmentDamage * 0.2)
		)
	});
}

/**
 * Projects melee readiness into the same cooldown vocabulary used by every hotbar slot.
 *
 * @param {number} now Current clock time in milliseconds.
 * @param {number} nextAttackAt Earliest accepted attack time.
 * @returns {Readonly<object>} Unified readiness and cooldown state.
 */
export function playerMeleeReadiness(now, nextAttackAt) {
	const cooldownRemainingMilliseconds = Math.max(0, nextAttackAt - now);
	const ready = cooldownRemainingMilliseconds <= 0;
	return Object.freeze({
		charges: ready ? 1 : 0,
		cooldownRemainingMilliseconds,
		globalCooldownRemainingMilliseconds: 0,
		maximumCharges: 1,
		ok: ready,
		reason: ready ? 'ready' : 'attack-cooldown'
	});
}

function finite(value, fallback) {
	return Number.isFinite(value) ? value : fallback;
}

function clamp(value, minimum, maximum) {
	return Math.min(maximum, Math.max(minimum, value));
}
