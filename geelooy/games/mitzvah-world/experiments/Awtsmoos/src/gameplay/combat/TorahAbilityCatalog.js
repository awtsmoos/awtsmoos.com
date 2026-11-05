// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TorahAbilityCatalog.js
 * @description Joins learned-passage timelines with canonical typed combat identities.
 * The Awtsmoos renews Torah intention through timing, affinity, element, and effect;
 * Awtsmoos.com keeps the passage source intact while shared combat truth stays correct.
 */

import { playerCombatDefinition } from '../affinity/CombatDefinitionCatalog.js';
import { torahPassage } from '../TorahPassageCatalog.js';

const DEFAULTS = Object.freeze({
	castMilliseconds: 0,
	channelMilliseconds: 0,
	chargeRecoveryMilliseconds: 0,
	charges: 1,
	globalCooldownMilliseconds: 1000,
	healing: 0,
	radius: 0,
	range: 0,
	shield: 0,
	stagger: 0
});

export const TORAH_ABILITY_CATALOG = Object.freeze([
	ability('grateful-awakening', 'Grateful Awakening', 'modeh-ani', 'Renew courage and a measure of health.',
		'awakening', { castType: 'instant', healing: 24, statusEffects: ['returning-spark'], targetType: 'self' }),
	ability('voice-of-unity', 'Voice of Unity', 'shema-unity', 'Sustain a chain of light through nearby concealment.',
		'unity', { castType: 'channel', channelMilliseconds: 2400, range: 15, statusEffects: ['light-of-clarity'], targetType: 'chain' }),
	ability('stillness-of-shabbos', 'Stillness of Shabbos', 'peace-prayer', 'Establish a peaceful field that delays hostile preparation.',
		'peace', { castType: 'cast', castMilliseconds: 900, radius: 7, statusEffects: ['stillness-of-shabbos'], targetType: 'ground-point' }),
	ability('light-against-concealment', 'Light Against Concealment', 'creation-light', 'Reveal a shadow weak point and disperse its concealment.',
		'illumination', { castType: 'cast', castMilliseconds: 700, range: 18, statusEffects: ['light-against-concealment'], targetType: 'selected-enemy' }),
	ability('shield-of-trust', 'Shield of Trust', 'guardian-path', 'Receive a measured protection against incoming harm.',
		'protection', { castType: 'instant', shield: 48, statusEffects: ['shield-of-trust'], targetType: 'self' }),
	ability('waters-of-purification', 'Waters of Purification', 'living-water', 'Cleanse one burden and grant brief resistance.',
		'purification', { castType: 'cast', castMilliseconds: 600, healing: 16, range: 16, statusEffects: ['waters-of-purification'], targetType: 'selected-ally' }),
	ability('merciful-restraint', 'Merciful Restraint', 'two-souls', 'Briefly bind a lesser hostile; damage may release it.',
		'restraint', { castType: 'instant', range: 14, statusEffects: ['merciful-restraint'], targetType: 'selected-enemy' }),
	ability('guarded-thought', 'Guarded Thought', 'small-city', 'Interrupt hostile preparation and guard against retaliation.',
		'clarity', { castType: 'reactive', range: 12, statusEffects: ['guarded-thought'], targetType: 'selected-enemy' }),
	ability('joy-breaks-barriers', 'Joy Breaks Barriers', 'joy-breaks-barriers', 'Gather joy, then release a warm wave of courage.',
		'joy', { castType: 'charged', castMilliseconds: 1400, charges: 2, chargeRecoveryMilliseconds: 11000, radius: 6, stagger: 28, targetType: 'cone' })
]);

const ABILITIES_BY_ID = new Map(TORAH_ABILITY_CATALOG.map(definition => [definition.id, definition]));

export function torahAbilityDefinition(abilityId) {
	return ABILITIES_BY_ID.get(abilityId) || null;
}

export function torahAbilityForPassage(passageId) {
	return TORAH_ABILITY_CATALOG.find(definition => definition.passageId === passageId) || null;
}

function ability(id, title, passageId, description, school, overrides) {
	const passage = torahPassage(passageId);
	const combat = playerCombatDefinition(id);
	if (!passage) throw new Error(`Unknown Torah passage for ability: ${passageId}`);
	if (!combat) throw new Error(`Unknown canonical combat action for ability: ${id}`);
	return Object.freeze({
		...DEFAULTS,
		...overrides,
		affinityId: combat.affinityId,
		applyStatusIds: Object.freeze([...(combat.applyStatusIds || [])]),
		audioEvent: `torah:${id}:audio`,
		canonicalActionId: combat.id,
		cooldownMilliseconds: passage.cooldownMs,
		counterGuidance: combat.counterGuidance,
		damage: passage.damage,
		danger: combat.danger,
		description,
		elementId: combat.elementId,
		englishName: combat.englishName,
		hebrewName: combat.hebrewName,
		id,
		interruptForce: combat.interruptForce || 0,
		passageId,
		questTags: Object.freeze(['torah:use', id]),
		removeStatusIds: Object.freeze([...(combat.removeStatusIds || [])]),
		resourceCost: passage.focusCost,
		school,
		statusEffects: Object.freeze([...(overrides.statusEffects || [])]),
		tags: Object.freeze([...(combat.tags || [])]),
		title,
		unlockCondition: Object.freeze({ passageId, type: 'passage-learned' }),
		visualEvent: `torah:${id}:visual`
	});
}
