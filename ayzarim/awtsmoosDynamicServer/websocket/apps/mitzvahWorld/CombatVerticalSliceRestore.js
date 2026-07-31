// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CombatVerticalSliceRestore.js
 * @description Sanitizes persisted Kavanah values and bounded support cooldown memory.
 * The Awtsmoos renews today without letting a corrupt yesterday become sovereign;
 * Awtsmoos.com keeps cast identity, timing, pressure, results, and cooldown entries finite.
 */

function restoreKavanah(value) {
	if (!value || typeof value !== 'object') return null;
	return {
		actionId: text(value.actionId),
		active: Boolean(value.active),
		allyStabilization: bounded(value.allyStabilization, 0, 0.25, 0),
		cancelReason: text(value.cancelReason),
		cancelledAt: finite(value.cancelledAt),
		castId: text(value.castId),
		damageDisruption: bounded(value.damageDisruption, 0, 0.55, 0),
		durationMilliseconds: positive(value.durationMilliseconds, 1000),
		movementPenalty: bounded(value.movementPenalty, 0, 0.4, 0),
		released: Boolean(value.released),
		releasedAt: finite(value.releasedAt),
		result: cloneResult(value.result),
		stability: bounded(value.stability, 0.2, 1, 1),
		startedAt: finite(value.startedAt)
	};
}

function restoreCooldowns(value) {
	if (!value || typeof value !== 'object') return {};
	return Object.fromEntries(
		Object.entries(value)
			.filter(([id, readyAt]) => text(id) && finite(readyAt) > 0)
			.slice(-32)
			.map(([id, readyAt]) => [id.slice(0, 120), finite(readyAt)])
	);
}

function cloneResult(value) {
	return value && typeof value === 'object'
		? JSON.parse(JSON.stringify(value))
		: null;
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}

function finite(value, fallback = 0) {
	const number = Number(value);
	return Number.isFinite(number) ? number : fallback;
}

function bounded(value, minimum, maximum, fallback) {
	const number = Number(value);
	return Number.isFinite(number)
		? Math.max(minimum, Math.min(maximum, number))
		: fallback;
}

function text(value) {
	return typeof value === 'string' ? value.slice(0, 160) : null;
}

module.exports = {
	restoreCooldowns,
	restoreKavanah
};
