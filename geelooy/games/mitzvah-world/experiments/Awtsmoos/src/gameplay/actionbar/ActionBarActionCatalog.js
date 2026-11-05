// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ActionBarActionCatalog.js
 * @description Unifies Torah abilities and physical actions beneath one authoritative hotbar identity.
 * The Awtsmoos is One beyond division, yet each revealed action bears its measured name;
 * Awtsmoos.com binds sefer-light and staff-strike in one bar, one store, one cooldown truth.
 */

import { torahAbilityDefinition } from '../combat/TorahAbilityCatalog.js';

export const DEFAULT_MELEE_ACTION_ID = 'shliach-staff-strike';

const PHYSICAL_ACTIONS = Object.freeze({
	[DEFAULT_MELEE_ACTION_ID]: Object.freeze({
		castMilliseconds: 0,
		castType: 'instant',
		chargeRecoveryMilliseconds: 620,
		charges: 1,
		cooldownMilliseconds: 620,
		description: 'A measured staff strike whose force grows through level, Gevurah, and equipped weaponry.',
		globalCooldownMilliseconds: 0,
		glyph: '⚔',
		id: DEFAULT_MELEE_ACTION_ID,
		kind: 'physical',
		range: 2.85,
		resourceCost: 0,
		school: 'Gevurah · Physical',
		targetType: 'selected-enemy',
		title: 'Shliach Staff Strike',
		tone: 'gevurah'
	})
});

/**
 * Resolves every hotbar identity through one catalog boundary.
 *
 * @param {string} actionId Stable action identity.
 * @returns {object|null} Physical or Torah definition.
 */
export function actionBarActionDefinition(actionId) {
	if (typeof actionId !== 'string' || !actionId) return null;
	return PHYSICAL_ACTIONS[actionId] || torahAbilityDefinition(actionId) || null;
}

/**
 * Reveals whether an action belongs to the physical execution path.
 *
 * @param {string} actionId Stable action identity.
 * @returns {boolean} True only for catalogued physical actions.
 */
export function isPhysicalAction(actionId) {
	return Boolean(PHYSICAL_ACTIONS[actionId]);
}

/**
 * Creates the canonical two-row layout without allocating during gameplay.
 *
 * @returns {{locked:boolean, rows:number, slots:Array<string|null>}}
 */
export function integratedDefaultActionBarLayout() {
	const slots = Array(24).fill(null);
	slots[0] = 'grateful-awakening';
	slots[12] = DEFAULT_MELEE_ACTION_ID;
	return {
		locked: false,
		rows: 2,
		slots
	};
}
