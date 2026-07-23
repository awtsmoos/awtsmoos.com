// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ActionBarCombatGateway.js
 * @description Joins physical and Torah execution without creating a second combat authority.
 * The Awtsmoos shines through distinct vessels yet remains indivisibly One; staff and sefer rhyme,
 * while Awtsmoos.com routes both through the same target, turn, stores, events, and measured time.
 */

import { actionBarActionDefinition } from './ActionBarActionCatalog.js';

const TARGET_REQUIRED_TYPES = new Set(['chain', 'line', 'selected-enemy']);
const DIRECT_SUPPORT_TYPES = new Set(['self', 'selected-ally']);

export class ActionBarCombatGateway {
	constructor(options) {
		this.bus = options.bus || null;
		this.combat = options.combat;
		this.inventory = options.inventory;
		this.melee = options.melee;
		this.turns = options.turns || null;
	}

	activatePhysical(context = {}) {
		return this.melee?.attackNow(context) || unavailable('physical-action-unavailable');
	}

	physicalReadiness(now) {
		return this.melee?.readiness(now) || unavailable('physical-action-unavailable');
	}

	activateTorah(timeline, actionId, context = {}) {
		const readiness = timeline.readiness(actionId, context);
		if (!readiness.ok) return timeline.activate(actionId, context);
		const definition = actionBarActionDefinition(actionId);
		const turnDecision = this.reserveTorahTurn(definition, context);
		if (!turnDecision.ok) return this.publishTurnRejection(turnDecision, actionId);
		const result = timeline.activate(actionId, context);
		if (result?.ok === false) this.turns?.cancelPlayerAction(result.reason || 'torah-activation-rejected');
		return result;
	}

	torahReadiness(timeline, actionId, context = {}) {
		const readiness = timeline.readiness(actionId, context);
		if (!readiness.ok || !this.turns) return readiness;
		const turn = this.turns.playerReadiness(context.now);
		return turn.ok
			? { ...readiness, turnPhase: turn.phase }
			: { ...readiness, ok: false, reason: turn.reason, turnPhase: turn.phase };
	}

	reserveTorahTurn(definition, context) {
		if (!this.turns) return { ok: true, reason: 'untracked-action', tracked: false };
		return this.turns.reservePlayerAction({
			actionId: definition.id,
			durationMilliseconds: Number(definition.castMilliseconds || 0) + Number(definition.channelMilliseconds || 0),
			now: context.now,
			reason: 'torah-cast-reserved',
			source: context.source || 'action-bar'
		});
	}

	executeTorah(definition, context) {
		return this.combat.usePassage({ id: definition.passageId }, {
			requestId: context.castId,
			returnResult: true,
			skipPassageCooldown: true,
			targetRequired: TARGET_REQUIRED_TYPES.has(definition.targetType),
			turnReserved: true,
			worldImpactRequired: !DIRECT_SUPPORT_TYPES.has(definition.targetType)
		});
	}

	combatContext() {
		const target = this.combat.snapshot().selectedTarget;
		return {
			distance: target?.distance ?? target?.distanceToPlayer,
			facing: target?.facing !== false,
			target
		};
	}

	isTorahUnlocked(definition) {
		return this.inventory.snapshot().learned?.includes(definition.passageId) || false;
	}

	publishTurnRejection(turnDecision, actionId) {
		const result = { actionId, ok: false, reason: turnDecision.reason };
		this.bus?.emit('actionbar:result', result);
		return result;
	}
}

function unavailable(reason) {
	return {
		charges: 0,
		cooldownRemainingMilliseconds: 0,
		globalCooldownRemainingMilliseconds: 0,
		maximumCharges: 1,
		ok: false,
		reason
	};
}
