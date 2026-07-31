// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DaasKnowledgeService.js
 * @description Owns earned enemy knowledge, bounded group sharing, and anti-leak disclosure.
 * The Awtsmoos knows all hidden branches while the player earns only a measured view;
 * Awtsmoos.com keeps observation, survival, counters, mastery, persistence, and group insight lawful.
 */

const LEVELS = Object.freeze(['unknown', 'observed', 'studied', 'mastered']);

class DaasKnowledgeService {
	constructor(room) {
		this.room = room;
	}

	observe(player, enemyId, actionId) {
		return this.advance(player, enemyId, actionId, 1, 'observed');
	}

	survive(player, enemyId, actionId) {
		return this.advance(player, enemyId, actionId, 1, 'survived');
	}

	counter(player, enemyId, actionId) {
		return this.advance(player, enemyId, actionId, 2, 'countered');
	}

	master(player, enemyId, actionId) {
		return this.advance(player, enemyId, actionId, 3, 'mastered');
	}

	advance(player, enemyId, actionId, amount, reason) {
		if (!player || !enemyId || !actionId) return null;
		player.daasKnowledge ||= {};
		const key = `${enemyId}:${actionId}`;
		const record = normalize(player.daasKnowledge[key], enemyId, actionId);
		record.points = Math.min(6, record.points + Math.max(0, Number(amount || 0)));
		record.level = levelFor(record.points);
		record.lastReason = reason;
		player.daasKnowledge[key] = record;
		return Object.freeze({ ...record });
	}

	disclose(player, enemyId, action = {}, sharedPoints = 0) {
		const key = `${enemyId}:${action.id}`;
		const record = normalize(
			player?.daasKnowledge?.[key],
			enemyId,
			action.id
		);
		const points = Math.max(record.points, Math.min(3, Number(sharedPoints || 0)));
		const result = {
			danger: action.danger || 'unknown',
			id: action.id,
			level: levelFor(points),
			phase: action.phase || 'unknown',
			shape: action.shape || 'warning'
		};
		if (points >= 1) result.category = action.category || action.kind || null;
		if (points >= 3) {
			result.counterGuidance = action.counterGuidance || null;
			result.elementId = action.elementId || null;
		}
		if (points >= 5) result.interruptResistance = action.interruptResistance ?? null;
		return Object.freeze(result);
	}

	snapshot(player) {
		return Object.freeze(Object.fromEntries(
			Object.entries(player?.daasKnowledge || {}).map(([key, value]) => {
				return [key, Object.freeze({ ...value })];
			})
		));
	}
}

function normalize(value = {}, enemyId, actionId) {
	const points = Math.max(0, Math.min(6, Number(value.points || 0)));
	return {
		actionId: value.actionId || actionId || null,
		enemyId: value.enemyId || enemyId || null,
		lastReason: value.lastReason || null,
		level: levelFor(points),
		points
	};
}

function levelFor(points) {
	if (points >= 5) return LEVELS[3];
	if (points >= 3) return LEVELS[2];
	if (points >= 1) return LEVELS[1];
	return LEVELS[0];
}

module.exports = {
	DaasKnowledgeService
};
