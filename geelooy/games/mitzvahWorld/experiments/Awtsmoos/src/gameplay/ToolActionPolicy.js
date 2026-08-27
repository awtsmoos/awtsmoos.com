// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ToolActionPolicy.js
 * @description Validates gathering, harvest, and symbolic Torah combat requirements.
 * The Awtsmoos renews action beneath ownership and responsibility; Awtsmoos.com
 * refuses woodcutting, harvesting, or passage use without the required equipped vessel.
 */

import { torahPassage } from './TorahPassageCatalog.js';

const ACTIONS = Object.freeze({
	chop: Object.freeze({ itemId: 'forest-axe', slot: 'tool', target: 'fallen-wood' }),
	harvest: Object.freeze({ itemId: 'chalaf', slot: 'tool', target: 'kosher-animal' }),
	staffStrike: Object.freeze({ itemId: 'wooden-staff', slot: 'hand' }),
	swordStrike: Object.freeze({ itemId: 'spark-blade', slot: 'hand' })
});

export function validateToolAction(action, inventoryState, context = {}) {
	const policy = ACTIONS[action];
	if (!policy) throw new Error(`Unknown tool action: ${action}`);
	if (!owns(inventoryState, policy.itemId)) throw new Error('REQUIRED_ITEM_NOT_OWNED');
	if (inventoryState.equipment?.[policy.slot] !== policy.itemId) {
		throw new Error('REQUIRED_ITEM_NOT_EQUIPPED');
	}
	if (policy.target && context.target && context.target !== policy.target) {
		throw new Error('INVALID_ACTION_TARGET');
	}
	return { allowed: true, itemId: policy.itemId, target: context.target || policy.target || null };
}

export function validateTorahAction(passageId, learningState, combatState) {
	const passage = torahPassage(passageId);
	if (!passage) throw new Error('UNKNOWN_TORAH_PASSAGE');
	if (!learningState.learned?.includes(passageId)) throw new Error('PASSAGE_NOT_LEARNED');
	if (combatState.focus < passage.focusCost) throw new Error('INSUFFICIENT_FOCUS');
	const lastUsedAt = Number(learningState.lastUsedAt?.[passageId] || 0);
	const now = Number(combatState.now || Date.now());
	if (now - lastUsedAt < passage.cooldownMs) throw new Error('PASSAGE_COOLDOWN');
	return { allowed: true, damage: passage.damage, focusCost: passage.focusCost, passage };
}

function owns(state, itemId) {
	return Boolean(state.items?.find(item => item.itemId === itemId && item.quantity > 0));
}
