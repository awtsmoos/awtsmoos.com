// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TorahStatusEffectCatalog.js
 * @description Canonical Torah-themed effects with bounded timelines and explicit boss behavior.
 */

export const TORAH_STATUS_EFFECT_CATALOG = Object.freeze([
	effect('light-of-clarity', 'Light of Clarity', 'Reveals concealment and lowers hostile evasion.',
		8000, 0, 'clarity', { evasionMultiplier: 0.7, revealsHidden: true }),
	effect('shield-of-trust', 'Shield of Trust', 'Absorbs a measured amount of incoming harm.',
		10000, 0, 'protection', { absorb: 48 }, { refreshRule: 'replace-stronger' }),
	effect('flame-of-enthusiasm', 'Flame of Enthusiasm', 'Warm golden resolve steadily disperses shadow.',
		7000, 1000, 'enthusiasm', { damagePerTick: 5 }, { maximumStacks: 3, stackingRule: 'add' }),
	effect('stillness-of-shabbos', 'Stillness of Shabbos', 'Peace slows movement and hostile preparation.',
		6000, 0, 'peace', { attackPreparationMultiplier: 1.3, movementMultiplier: 0.65 }, { bossBehavior: 'half-strength' }),
	effect('waters-of-purification', 'Waters of Purification', 'Cleanses one burden and grants brief resistance.',
		5000, 0, 'purification', { cleanseCount: 1, resistanceMultiplier: 0.7 }),
	effect('voice-of-courage', 'Voice of Courage', 'Breaks fear and strengthens stagger resistance.',
		9000, 0, 'courage', { breaksFear: true, staggerResistance: 0.35 }),
	effect('light-against-concealment', 'Light Against Concealment', 'Reveals a shadow weak point and applies steady light.',
		8000, 1000, 'illumination', { damagePerTick: 4, revealsWeakPoint: true }, { bossBehavior: 'reveal-only' }),
	effect('merciful-restraint', 'Merciful Restraint', 'Briefly restrains a lesser hostile until struck.',
		3500, 0, 'restraint', { breakOnDamage: true, rooted: true }, { bossBehavior: 'immune' }),
	effect('guarded-thought', 'Guarded Thought', 'Grants brief protection from hostile interruption.',
		3000, 0, 'clarity', { interruptImmunity: true }),
	effect('returning-spark', 'Returning Spark', 'Returns a portion of subsequent effort as renewal.',
		10000, 0, 'awakening', { returnHealingRatio: 0.18, returnResourceRatio: 0.12 })
]);

const EFFECTS_BY_ID = new Map(TORAH_STATUS_EFFECT_CATALOG.map(definition => [definition.id, definition]));

export function torahStatusEffectDefinition(effectId) {
	return EFFECTS_BY_ID.get(effectId) || null;
}

function effect(id, title, tooltip, durationMilliseconds, tickIntervalMilliseconds, icon, modifiers, overrides = {}) {
	return Object.freeze({
		bossBehavior: overrides.bossBehavior || 'normal',
		dispelCategory: overrides.dispelCategory || 'torah-light',
		durationMilliseconds,
		icon,
		id,
		maximumStacks: overrides.maximumStacks || 1,
		modifiers: Object.freeze({ ...modifiers }),
		persistenceRule: 'combat-only',
		questEventRule: 'status:apply',
		refreshRule: overrides.refreshRule || 'refresh-duration',
		stackingRule: overrides.stackingRule || 'replace',
		tickIntervalMilliseconds,
		title,
		tooltip
	});
}
