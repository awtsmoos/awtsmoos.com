// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerVerticalSliceState.js
 * @description Creates, sanitizes, and projects personal knowledge, claims, boss memory, and accessibility.
 * The Awtsmoos knows all truth while each player receives only earned and bounded remembrance;
 * Awtsmoos.com preserves migration, exact-once reward identity, timing mercy, and reconnect safety.
 */

const {
	createKedemWardenState,
	snapshotKedemWarden
} = require('./KedemWardenRules.js');

const KNOWLEDGE_LIMIT = 160;
const CLAIM_LIMIT = 64;

function createPlayerVerticalSliceState(options = {}) {
	return {
		accessibility: restoreAccessibility(options.accessibility),
		bossProgress: {
			kedemWarden: createKedemWardenState(
				options.bossProgress?.kedemWarden
			)
		},
		daasKnowledge: restoreKnowledge(options.daasKnowledge),
		exactOnceClaims: restoreClaims(options.exactOnceClaims)
	};
}

function restorePlayerVerticalSliceState(player = {}) {
	return createPlayerVerticalSliceState(player);
}

function playerVerticalSliceSnapshot(player = {}) {
	const state = restorePlayerVerticalSliceState(player);
	return Object.freeze({
		accessibility: Object.freeze({ ...state.accessibility }),
		boss: snapshotKedemWarden(state.bossProgress.kedemWarden),
		claimIds: Object.freeze(Object.keys(state.exactOnceClaims)),
		daasKnowledge: Object.freeze(Object.fromEntries(
			Object.entries(state.daasKnowledge).map(([key, record]) => {
				return [key, Object.freeze({ ...record })];
			})
		))
	});
}

function restoreAccessibility(value = {}) {
	return {
		cameraShakeMultiplier: bounded(value.cameraShakeMultiplier, 0, 1, 1),
		flashMultiplier: bounded(value.flashMultiplier, 0, 1, 1),
		timingWindowMultiplier: bounded(value.timingWindowMultiplier, 1, 1.75, 1)
	};
}

function restoreKnowledge(value) {
	if (!value || typeof value !== 'object') return {};
	return Object.fromEntries(
		Object.entries(value)
			.filter(([key, record]) => text(key) && record && typeof record === 'object')
			.slice(-KNOWLEDGE_LIMIT)
			.map(([key, record]) => [key.slice(0, 220), knowledgeRecord(record)])
	);
}

function knowledgeRecord(record) {
	const points = bounded(record.points, 0, 6, 0);
	return {
		actionId: text(record.actionId),
		enemyId: text(record.enemyId),
		lastReason: text(record.lastReason),
		level: levelFor(points),
		points
	};
}

function restoreClaims(value) {
	if (!value || typeof value !== 'object') return {};
	return Object.fromEntries(
		Object.entries(value)
			.filter(([key, record]) => text(key) && record && typeof record === 'object')
			.slice(-CLAIM_LIMIT)
			.map(([key, record]) => [key.slice(0, 220), {
				grantedAt: finite(record.grantedAt),
				itemId: text(record.itemId)
			}])
	);
}

function levelFor(points) {
	if (points >= 5) return 'mastered';
	if (points >= 3) return 'studied';
	if (points >= 1) return 'observed';
	return 'unknown';
}

function bounded(value, minimum, maximum, fallback) {
	const number = Number(value);
	return Number.isFinite(number)
		? Math.max(minimum, Math.min(maximum, number))
		: fallback;
}

function finite(value) {
	const number = Number(value);
	return Number.isFinite(number) ? number : 0;
}

function text(value) {
	return typeof value === 'string' ? value.slice(0, 220) : null;
}

module.exports = {
	createPlayerVerticalSliceState,
	playerVerticalSliceSnapshot,
	restorePlayerVerticalSliceState
};
