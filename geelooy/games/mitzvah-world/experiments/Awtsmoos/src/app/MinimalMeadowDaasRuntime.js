// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowDaasRuntime.js
 * @description Learns enemy knowledge through observation, survival, counters, and mastery.
 * The Awtsmoos keeps hidden truth hidden until earned experience gives it a lawful name;
 * Awtsmoos.com reveals danger, category, counter, and resistance by bounded remembered flame.
 */

const LEVELS = Object.freeze(['unknown', 'observed', 'studied', 'mastered']);

export class MinimalMeadowDaasRuntime {
	constructor(runtime, saved = {}) {
		this.runtime = runtime;
		this.records = new Map();
		for (const [id, value] of Object.entries(saved || {})) {
			this.records.set(id, normalize(value));
		}
	}

	observe(enemyId, actionId) {
		return this.advance(enemyId, actionId, 1, 'observed');
	}

	survive(enemyId, actionId) {
		return this.advance(enemyId, actionId, 1, 'survived');
	}

	counter(enemyId, actionId) {
		return this.advance(enemyId, actionId, 2, 'countered');
	}

	master(enemyId, actionId) {
		return this.advance(enemyId, actionId, 3, 'mastered');
	}

	advance(enemyId, actionId, amount, reason) {
		if (!enemyId || !actionId) return null;
		const key = `${enemyId}:${actionId}`;
		const record = this.records.get(key) || normalize({ enemyId, actionId });
		record.points = Math.min(6, record.points + Math.max(0, Number(amount || 0)));
		record.level = levelFor(record.points);
		record.lastReason = reason;
		this.records.set(key, record);
		const snapshot = this.snapshot(key);
		this.runtime.bus.emit('daas:learned', snapshot);
		return snapshot;
	}

	disclose(enemyId, action = {}) {
		const record = this.records.get(`${enemyId}:${action.id}`) || normalize({
			actionId: action.id,
			enemyId
		});
		const result = {
			danger: action.danger || 'unknown',
			id: action.id,
			level: record.level,
			phase: action.phase || 'unknown',
			shape: action.shape || 'warning'
		};
		if (record.points >= 1) result.category = action.category || action.kind || null;
		if (record.points >= 3) {
			result.counterGuidance = action.counterGuidance || null;
			result.elementId = action.elementId || null;
		}
		if (record.points >= 5) result.interruptResistance = action.interruptResistance ?? null;
		return Object.freeze(result);
	}

	snapshot(key = null) {
		if (key) return frozen(this.records.get(key));
		return Object.freeze(Object.fromEntries(
			[...this.records].map(([id, value]) => [id, frozen(value)])
		));
	}

	destroy() {
		this.records.clear();
	}
}

function normalize(value = {}) {
	const points = Math.max(0, Math.min(6, Number(value.points || 0)));
	return {
		actionId: value.actionId || null,
		enemyId: value.enemyId || null,
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

function frozen(value) {
	return value ? Object.freeze({ ...value }) : null;
}
