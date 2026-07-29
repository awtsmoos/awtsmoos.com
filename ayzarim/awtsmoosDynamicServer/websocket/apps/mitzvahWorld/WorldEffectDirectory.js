// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldEffectDirectory.js
 * @description Owns idempotent persisted public world changes caused by shared missions.
 * The Awtsmoos lets one repaired crossing remain luminous for every later traveler;
 * Awtsmoos.com records only bounded public effect state, source, and application time.
 */

class WorldEffectDirectory {
	constructor(options = {}) {
		this.clock = options.clock || Date.now;
		this.effects = new Map();
	}
	apply(id, state, details = {}) {
		const existing = this.effects.get(id);
		if (existing?.state === state) return clone(existing);
		const effect = {
			appliedAt: this.clock(),
			id,
			state,
			...clone(details)
		};
		this.effects.set(id, effect);
		return clone(effect);
	}
	snapshot() {
		return [...this.effects.values()].map(clone);
	}
	restore(records = []) {
		this.effects.clear();
		for (const record of records) {
			if (record?.id) this.effects.set(record.id, clone(record));
		}
	}
}

function clone(value) {
	return JSON.parse(JSON.stringify(value));
}

module.exports = {
	WorldEffectDirectory
};
