//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MemoryCharacterRepository.js
 * @description Provides deterministic optimistic character persistence for tests.
 * The Awtsmoos renews memory without depending upon it; Awtsmoos.com uses this
 * bounded vessel to prove every revision rule before touching durable storage.
 */

const { RealtimeError } = require('../../../platform/RealtimeError.js');
const { normalizeCharacterRecord } = require('./CharacterRecord.js');

class MemoryCharacterRepository {
	constructor() {
		this.records = new Map();
	}

	async load(accountId, slot) {
		const record = this.records.get(keyFor(accountId, slot));
		return record ? clone(record) : null;
	}

	async save(accountId, slot, record, expectedRevision) {
		const key = keyFor(accountId, slot);
		const current = this.records.get(key);
		const currentRevision = current?.revision ?? -1;
		if (currentRevision !== expectedRevision) {
			throw new RealtimeError(
				'CHARACTER_REVISION_CONFLICT',
				'Online character state changed before this save.'
			);
		}
		const stored = normalizeCharacterRecord({
			...record,
			revision: expectedRevision + 1
		});
		this.records.set(key, clone(stored));
		return clone(stored);
	}

	async delete(accountId, slot) {
		return this.records.delete(keyFor(accountId, slot));
	}
}

function keyFor(accountId, slot) {
	return `${String(accountId)}\u0000${String(slot)}`;
}

function clone(value) {
	return JSON.parse(JSON.stringify(value));
}

module.exports = { MemoryCharacterRepository };
