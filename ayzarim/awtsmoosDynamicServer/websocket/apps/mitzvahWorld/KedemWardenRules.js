// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file KedemWardenRules.js
 * @description Owns authoritative boss phase, concealment, scaling, reset, and exact reward identity.
 * The Awtsmoos lets one encounter change its revealed vessel without changing its law;
 * Awtsmoos.com keeps health thresholds, reconnect state, solo/group scale, wipe, and reward exact.
 */

const KEDEM_WARDEN_ID = 'kedem-letter-warden';
const KEDEM_REWARD_CLAIM = 'vertical-slice:kedem-warden:first-clear';

function createKedemWardenState(source = {}) {
	return {
		defeated: Boolean(source.defeated),
		phase: boundedInteger(source.phase, 1, 3, 1),
		resetCount: Math.max(0, Number(source.resetCount || 0)),
		rewardClaimId: KEDEM_REWARD_CLAIM,
		startedAt: finite(source.startedAt),
		wipeCount: Math.max(0, Number(source.wipeCount || 0))
	};
}

function updateKedemWardenPhase(state, health, maximumHealth, playerCount = 1) {
	const boss = state || createKedemWardenState();
	const maximum = Math.max(1, Number(maximumHealth || 1));
	const ratio = Math.max(0, Math.min(1, Number(health || 0) / maximum));
	const phase = ratio <= 0.34 ? 3 : ratio <= 0.67 ? 2 : 1;
	const changed = phase !== boss.phase;
	boss.phase = phase;
	boss.defeated = ratio === 0;
	return Object.freeze({
		changed,
		concealed: phase === 3,
		defeated: boss.defeated,
		healthRatio: Number(ratio.toFixed(3)),
		label: phaseLabel(phase),
		phase,
		scale: encounterScale(playerCount),
		text: phaseText(phase)
	});
}

function resetKedemWarden(state, reason = 'reset') {
	const boss = state || createKedemWardenState();
	boss.defeated = false;
	boss.phase = 1;
	boss.resetCount += 1;
	if (reason === 'wipe') boss.wipeCount += 1;
	boss.startedAt = 0;
	return snapshotKedemWarden(boss, reason);
}

function snapshotKedemWarden(state, reason = null) {
	const boss = state || createKedemWardenState();
	return Object.freeze({
		defeated: boss.defeated,
		label: phaseLabel(boss.phase),
		phase: boss.phase,
		reason,
		resetCount: boss.resetCount,
		rewardClaimId: boss.rewardClaimId,
		startedAt: boss.startedAt,
		text: phaseText(boss.phase),
		wipeCount: boss.wipeCount
	});
}

function encounterScale(playerCount) {
	const count = Math.max(1, Math.min(5, Number(playerCount || 1)));
	return Object.freeze({
		damage: Number((1 + (count - 1) * 0.18).toFixed(2)),
		health: Number((1 + (count - 1) * 0.48).toFixed(2)),
		players: count
	});
}

function phaseLabel(phase) {
	return ['Measure', 'Division', 'Concealment and Unification'][phase - 1];
}

function phaseText(phase) {
	if (phase === 2) return 'Two bounded zones divide the arena before an individual seal.';
	if (phase === 3) return 'Clarify the concealed glyph, break posture, then release.';
	return 'The Warden measures movement and guards against repeated frontal pressure.';
}

function boundedInteger(value, minimum, maximum, fallback) {
	const number = Math.round(Number(value));
	return Number.isFinite(number)
		? Math.max(minimum, Math.min(maximum, number))
		: fallback;
}

function finite(value, fallback = 0) {
	const number = Number(value);
	return Number.isFinite(number) ? number : fallback;
}

module.exports = {
	KEDEM_REWARD_CLAIM,
	KEDEM_WARDEN_ID,
	createKedemWardenState,
	resetKedemWarden,
	snapshotKedemWarden,
	updateKedemWardenPhase
};
