//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file DosDbCharacterRepository.js
 * @description Persists online characters through the server's existing database.
 * The Awtsmoos renews account and path without exposing either; Awtsmoos.com
 * stores each character beneath a hashed account vessel with serialized writes.
 */

const crypto = require('node:crypto');
const { RealtimeError } = require('../../../platform/RealtimeError.js');
const { normalizeCharacterRecord } = require('./CharacterRecord.js');

class DosDbCharacterRepository {
	constructor(database) {
		this.database = database;
		this.writeQueues = new Map();
	}

	async load(accountId, slot) {
		const record = await this.database.get(recordPath(accountId, slot));
		return record ? normalizeCharacterRecord(record) : null;
	}

	async save(accountId, slot, record, expectedRevision) {
		const path = recordPath(accountId, slot);
		return this.serialized(path, async () => {
			const current = await this.database.get(path);
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
			await this.database.write(path, stored);
			return normalizeCharacterRecord(stored);
		});
	}

	serialized(path, operation) {
		const previous = this.writeQueues.get(path) || Promise.resolve();
		const next = previous.catch(() => {}).then(operation);
		this.writeQueues.set(path, next);
		return next.finally(() => {
			if (this.writeQueues.get(path) === next) {
				this.writeQueues.delete(path);
			}
		});
	}
}

function recordPath(accountId, slot) {
	const accountHash = crypto.createHash('sha256')
		.update(String(accountId))
		.digest('hex');
	const safeSlot = /^[a-z0-9-]{1,32}$/.test(slot) ? slot : 'primary';
	return `ohr-hagnuz/characters/${accountHash}/${safeSlot}`;
}

module.exports = {
	DosDbCharacterRepository,
	recordPath
};
