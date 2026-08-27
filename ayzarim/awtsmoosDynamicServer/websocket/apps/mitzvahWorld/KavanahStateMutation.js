// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file KavanahStateMutation.js
 * @description Mutates authoritative preparation while focused value helpers guard bounds and receipts.
 * The Awtsmoos renews intention beneath pressure without trusting client-made consequence;
 * Awtsmoos.com bounds movement, disruption, ally support, cancellation, and public state.
 */

const {
	acceptedKavanah,
	boundedKavanahNumber,
	effectiveKavanahStability,
	kavanahText,
	positiveKavanahNumber,
	rejectedKavanah,
	snapshotKavanahState
} = require('./KavanahStateValue.js');

function startKavanahState(player, payload, sequence, now) {
	const actionId = kavanahText(payload.actionId);
	if (!actionId) return rejectedKavanah('ACTION_REQUIRED');
	if (player.combat.kavanah?.active) {
		return rejectedKavanah('KAVANAH_ALREADY_ACTIVE');
	}
	const state = {
		actionId,
		active: true,
		allyStabilization: 0,
		castId: `kavanah-${player.id}-${sequence}`,
		damageDisruption: 0,
		durationMilliseconds: positiveKavanahNumber(
			payload.durationMilliseconds,
			1000
		),
		movementPenalty: 0,
		released: false,
		stability: 1,
		startedAt: now
	};
	player.combat.kavanah = state;
	return acceptedKavanah('started', snapshotKavanahState(state, now));
}

function moveKavanahState(player, magnitude, now) {
	const state = activeState(player);
	if (!state) return rejectedKavanah('KAVANAH_NOT_ACTIVE');
	state.movementPenalty = Math.min(
		0.4,
		state.movementPenalty
			+ boundedKavanahNumber(magnitude, 0, 1, 0) * 0.08
	);
	state.stability = effectiveKavanahStability(state);
	return acceptedKavanah(
		'movement-recorded',
		snapshotKavanahState(state, now)
	);
}

function disruptKavanahState(player, damage, now) {
	const state = activeState(player);
	if (!state) return null;
	state.damageDisruption = Math.min(
		0.55,
		state.damageDisruption
			+ Math.min(0.25, Math.max(0, Number(damage || 0)) / 160)
	);
	state.stability = effectiveKavanahStability(state);
	return snapshotKavanahState(state, now);
}

function stabilizeKavanahState(player, strength, now) {
	const state = activeState(player);
	if (!state) return rejectedKavanah('KAVANAH_NOT_ACTIVE');
	state.allyStabilization = Math.min(
		0.25,
		state.allyStabilization
			+ boundedKavanahNumber(strength, 0, 0.25, 0.12)
	);
	state.stability = effectiveKavanahStability(state);
	return acceptedKavanah(
		'stabilized',
		snapshotKavanahState(state, now)
	);
}

function cancelKavanahState(player, reason, now) {
	const state = activeState(player);
	if (!state) return rejectedKavanah('KAVANAH_NOT_ACTIVE');
	state.active = false;
	state.cancelledAt = now;
	state.cancelReason = kavanahText(reason) || 'cancelled';
	return acceptedKavanah(
		'cancelled',
		snapshotKavanahState(state, now)
	);
}

function activeState(player) {
	return player.combat.kavanah?.active
		? player.combat.kavanah
		: null;
}

module.exports = {
	cancelKavanahState,
	disruptKavanahState,
	effectiveKavanahStability,
	moveKavanahState,
	snapshotKavanahState,
	stabilizeKavanahState,
	startKavanahState
};
