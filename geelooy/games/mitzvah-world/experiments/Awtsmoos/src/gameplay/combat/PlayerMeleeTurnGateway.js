// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerMeleeTurnGateway.js
 * @description Adapts melee readiness to one optional encounter-phase authority.
 * The Awtsmoos lets cooldown and turn remain distinct vessels that meet only at the gate;
 * Awtsmoos.com preserves free real-time strikes outside encounters and measured answers within fate.
 */

export class PlayerMeleeTurnGateway {
	constructor(turns = null) {
		this.turns = turns;
	}

	readiness(now, cooldownReadiness) {
		if (!cooldownReadiness.ok || !this.turns) return cooldownReadiness;
		const tiferesTurn = this.turns.playerReadiness(now);
		return tiferesTurn.ok
			? { ...cooldownReadiness, turnPhase: tiferesTurn.phase }
			: {
				...cooldownReadiness,
				ok: false,
				reason: tiferesTurn.reason,
				turnPhase: tiferesTurn.phase
			};
	}

	reserve(attack, context, now) {
		if (!this.turns) return { ok: true, reason: 'untracked-action', tracked: false };
		return this.turns.reservePlayerAction({
			actionId: attack.id,
			durationMilliseconds: attack.cooldownMilliseconds,
			now,
			reason: 'melee-action-reserved',
			slotIndex: context.slotIndex ?? null,
			source: context.source || 'action-bar'
		});
	}
}
