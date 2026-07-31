// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file KavanahService.js
 * @description Orchestrates server-owned deliberate actions while focused helpers mutate state.
 * The Awtsmoos renews intention while the server guards action, duration, and release;
 * Awtsmoos.com rejects arbitrary names, client timing, duplicates, stale casts, and overhold deceit.
 */

const {
	requireKavanahAction
} = require('./KavanahActionCatalog.js');
const { evaluateKavanahRelease } = require('./KavanahRules.js');
const {
	cancelKavanahState,
	disruptKavanahState,
	effectiveKavanahStability,
	moveKavanahState,
	snapshotKavanahState,
	stabilizeKavanahState,
	startKavanahState
} = require('./KavanahStateMutation.js');
const { measuredIntentModifiers } = require('./VerticalSliceRewardRules.js');

class KavanahService {
	constructor(options = {}) {
		this.clock = options.clock || Date.now;
		this.sequence = 0;
	}

	start(player, payload = {}) {
		const action = requireKavanahAction(payload.actionId);
		this.sequence += 1;
		return startKavanahState(
			player,
			action,
			this.sequence,
			this.clock()
		);
	}

	release(player, payload = {}) {
		const state = player.combat.kavanah;
		if (!state?.active) return rejected('KAVANAH_NOT_ACTIVE');
		if (payload.castId && payload.castId !== state.castId) {
			return rejected('STALE_KAVANAH_CAST');
		}
		if (state.released) return rejected('DUPLICATE_KAVANAH_RELEASE');
		const now = this.clock();
		const modifiers = measuredIntentModifiers(player);
		const evaluation = evaluateKavanahRelease({
			accessibilityMultiplier: Math.max(
				modifiers.timingWindowMultiplier,
				Number(player.accessibility?.timingWindowMultiplier || 1)
			),
			damageDisruption: state.damageDisruption,
			durationMilliseconds: state.durationMilliseconds,
			elapsedMilliseconds: now - state.startedAt,
			movementPenalty: state.movementPenalty,
			stability: effectiveKavanahStability(state)
		});
		state.active = false;
		state.released = true;
		state.releasedAt = now;
		state.result = evaluation;
		return accepted('released', {
			...snapshotKavanahState(state, now),
			evaluation
		});
	}

	move(player, payload = {}) {
		const state = player.combat.kavanah;
		if (!state?.active) return rejected('KAVANAH_NOT_ACTIVE');
		if (payload.castId && payload.castId !== state.castId) {
			return rejected('STALE_KAVANAH_CAST');
		}
		return moveKavanahState(
			player,
			payload.magnitude,
			this.clock()
		);
	}

	disrupt(player, damage) {
		return disruptKavanahState(player, damage, this.clock());
	}

	stabilize(player, strength = 0.12) {
		return stabilizeKavanahState(player, strength, this.clock());
	}

	cancel(player, reason = 'cancelled') {
		return cancelKavanahState(player, reason, this.clock());
	}

	snapshot(player) {
		const state = player.combat.kavanah;
		return state ? snapshotKavanahState(state, this.clock()) : null;
	}
}

function accepted(reason, kavanah) {
	return Object.freeze({ accepted: true, kavanah, reason });
}

function rejected(reason) {
	return Object.freeze({ accepted: false, reason });
}

module.exports = {
	KavanahService
};
