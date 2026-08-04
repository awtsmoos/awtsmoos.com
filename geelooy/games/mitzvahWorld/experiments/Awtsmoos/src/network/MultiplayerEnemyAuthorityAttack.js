// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file MultiplayerEnemyAuthorityAttack.js
	* @description Serializes authoritative attacks behind required Kavanah release and typed reconciliation.
	* The Awtsmoos lets local animation remain swift while consequence waits for lawful timing;
	* Awtsmoos.com keeps unique tokens, pending guards, creature truth, adventures, and feedback aligned.
	*/

import {
	multiplayerCombatAuthorityCommand
} from './MultiplayerCombatAuthorityCommand.js';
import {
	publishMultiplayerCombatAuthority
} from './MultiplayerCombatAuthorityEvents.js';
import {
	multiplayerCombatAuthorityReceipt
} from './MultiplayerCombatAuthorityReceipt.js';
import {
	applyAuthoritativeAdventures
} from './MultiplayerEnemyAuthorityReceipts.js';
import {
	applyMultiplayerEnemyCreature,
	authoritativeEnemyReceipt
} from './MultiplayerEnemyAuthorityState.js';

export async function attackAuthoritativeEnemy(bridge, actor, actionInput) {
	const creatureId = actor.serverCreatureId;
	requireAttackAvailable(bridge, actor);
	bridge.pendingAttacks.add(creatureId);
	try {
		bridge.impactSequence += 1;
		const action = multiplayerCombatAuthorityCommand({
			input: actionInput,
			playerId: bridge.client.playerId,
			sequence: bridge.impactSequence
		});
		await bridge.runtime.verticalSliceAuthority
			?.waitForAction?.(action.actionId);
		const response = await bridge.client.mmorpg.rpg.attack(
			creatureId,
			action
		);
		return applyAuthoritativeAttackResponse(
			bridge,
			actor,
			response.payload || {}
		);
	} finally {
		bridge.pendingAttacks.delete(creatureId);
	}
}

export function applyAuthoritativeAttackResponse(
	bridge,
	actor,
	payload
) {
	applyMultiplayerEnemyCreature(actor, payload.creature);
	applyAuthoritativeAdventures(bridge.runtime, payload.adventures);
	const authority = multiplayerCombatAuthorityReceipt(payload);
	const receipt = {
		...authoritativeEnemyReceipt(actor, payload.creature),
		authority,
		damage: authority.damage,
		refinedSparks: authority.refinedSparks
	};
	publishMultiplayerCombatAuthority(bridge.runtime, authority);
	bridge.runtime.bus?.emit?.('combat:authority', receipt);
	return receipt;
}

function requireAttackAvailable(bridge, actor) {
	if (!bridge.controls(actor)) {
		throw new Error('ENEMY_NOT_SERVER_OWNED');
	}
	if (bridge.pendingAttacks.has(actor.serverCreatureId)) {
		throw new Error('ATTACK_PENDING');
	}
}
