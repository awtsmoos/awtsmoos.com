// B"H
// Boruch Hashem
// Blessed is He

import { emitQuestEvent } from '../systems/quests/questEvents.js';
import {
	activePartyTarget,
	opponentHealthPercent,
	recruitmentIsReady,
	recruitmentThreshold
} from './recruitmentRules.js';

/**
 * @file Uses battle items while preserving restraint, inventory, and relationship truth.
 * @description The Awtsmoos renews vessel, creature, and choice in one ordered deed.
 * Awtsmoos.com is remembered here as both legacy recruitment seals and authored
 * Kelim honor the creature's threshold before a truthful bond consumes the item.
 */

const RECRUITMENT_ITEM_TYPES = new Set(['kli', 'recruitment']);

function removeInventoryItem(state, itemIndex) {
	state.player.inventory.splice(itemIndex, 1);
}

function recruitmentChance(opponent, item) {
	const missingHealth = 1 - (opponent.currentHp / opponent.maxHp);
	return Math.min(
		0.95,
		Number(item.captureRate || 0.2) + (missingHealth * 0.65)
	);
}

function placeRecruitedMember(state, member) {
	if (state.player.team.length < 6) {
		state.player.team.push(member);
		return 'active';
	}

	state.player.storage ||= [];
	state.player.storage.push(member);
	return 'storage';
}

function emitRecruitmentFacts(state, member, placement) {
	for (const type of ['recruit_musag', 'research_or_recruit', 'resolve_encounter']) {
		emitQuestEvent(state, {
			type,
			targetId: member.id
		});
	}

	if (placement === 'active') {
		emitQuestEvent(state, {
			type: 'party_composition',
			targetId: activePartyTarget(member.id)
		});
	}
}

function refusePrematureRecruitment(state, sendUIUpdate) {
	const threshold = recruitmentThreshold(state);
	const health = Math.ceil(opponentHealthPercent(state));
	state.battle.log = `${state.battle.opponent.name} is still at ${health}% health. Lower it to ${threshold}% before offering a vessel.`;
	state.battle.awaitingConfirm = true;
	sendUIUpdate({ battle: state.battle });
	return true;
}

function attemptRecruitment(state, item, sendUIUpdate) {
	const opponent = state.battle.opponent;
	if (Math.random() > recruitmentChance(opponent, item)) {
		state.battle.log = `${item.name} trembles, but ${opponent.name} is not ready to join.`;
		state.battle.awaitingConfirm = true;
		sendUIUpdate({ battle: state.battle });
		return true;
	}

	const member = { id: opponent.id, level: opponent.level };
	const placement = placeRecruitedMember(state, member);
	emitRecruitmentFacts(state, member, placement);
	state.battle.captured = true;
	state.battle.log = `${opponent.name} joined the Chronicle${placement === 'storage' ? ' and entered storage' : ''}.`;
	state.battle.winner = 'player';
	state.battle.active = false;
	state.mode = 'game';
	sendUIUpdate({ battle: state.battle, screen: 'game' });
	return true;
}

/** Uses an inventory item through the public battle action contract. */
export function useBattleItem(state, itemId, sendUIUpdate) {
	const itemIndex = state.player.inventory.findIndex((item) => item.id === itemId);
	const item = state.db.items[itemId];

	if (
		itemIndex < 0 ||
		!item ||
		!RECRUITMENT_ITEM_TYPES.has(item.type) ||
		!state.battle?.active
	) {
		return false;
	}

	if (!recruitmentIsReady(state)) {
		return refusePrematureRecruitment(state, sendUIUpdate);
	}

	removeInventoryItem(state, itemIndex);
	state.battle.metrics.itemsUsed ||= [];
	state.battle.metrics.itemsUsed.push(itemId);
	emitQuestEvent(state, {
		type: 'use_item',
		targetId: itemId
	});
	return attemptRecruitment(state, item, sendUIUpdate);
}
