// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CombatVerticalSliceState.js
 * @description Creates, restores, revives, and projects authoritative Kavanah and posture state.
 * The Awtsmoos renews intention and composure without letting stale records command today;
 * Awtsmoos.com bounds preparation, cooldown memory, break immunity, and reconnect truth.
 */

const {
	restoreCooldowns,
	restoreKavanah
} = require('./CombatVerticalSliceRestore.js');
const { createPostureState } = require('./PostureRules.js');

function createCombatVerticalSliceState(options = {}) {
	return {
		kavanah: restoreKavanah(options.kavanah),
		posture: createPostureState(
			options.posture,
			options.postureMaximum
		),
		supportCooldowns: restoreCooldowns(options.supportCooldowns)
	};
}

function restoreCombatVerticalSliceState(combat = {}) {
	return createCombatVerticalSliceState(combat);
}

function reviveCombatVerticalSliceState(combat) {
	combat.kavanah = null;
	combat.posture = createPostureState({}, combat.posture?.maximum);
	return combatVerticalSliceSnapshot(combat);
}

function combatVerticalSliceSnapshot(combat = {}) {
	return Object.freeze({
		kavanah: publicKavanah(combat.kavanah),
		posture: publicPosture(combat.posture),
		supportCooldowns: Object.freeze({
			...restoreCooldowns(combat.supportCooldowns)
		})
	});
}

function publicKavanah(value) {
	if (!value) return null;
	return Object.freeze({
		actionId: value.actionId,
		active: value.active,
		castId: value.castId,
		durationMilliseconds: value.durationMilliseconds,
		released: value.released,
		result: value.result || null,
		stability: value.stability,
		startedAt: value.startedAt
	});
}

function publicPosture(value = {}) {
	const maximum = positive(value.maximum, 100);
	return Object.freeze({
		brokenUntil: finite(value.brokenUntil),
		immunityUntil: finite(value.immunityUntil),
		maximum,
		value: bounded(value.value, 0, maximum, maximum)
	});
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

module.exports = {
	combatVerticalSliceSnapshot,
	createCombatVerticalSliceState,
	restoreCombatVerticalSliceState,
	reviveCombatVerticalSliceState
};
