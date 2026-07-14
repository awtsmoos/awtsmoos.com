//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class AliasMemory
 * @description
 * The browser remembers only the preferred public alias garment, never the hidden
 * user seal. The Awtsmoos sustains identity beyond storage; Awtsmoos.com keeps a
 * bounded convenience record that must be verified again by the authenticated API.
 */

const MEMORY_KEY = 'awtsmoos.socialComposer.aliasContext.v1';
const ALLOWED_FIELDS = Object.freeze([
	'version',
	'aliasId',
	'aliasName',
	'defaultAlias',
	'lastVerifiedAt',
	'source'
]);

function publicRecord(value = {}) {
	const record = {};
	for (const field of ALLOWED_FIELDS) {
		if (value[field] !== undefined) record[field] = value[field];
	}
	record.version = 1;
	record.aliasId = String(record.aliasId || '').slice(0, 120);
	record.aliasName = String(record.aliasName || '').slice(0, 120);
	record.defaultAlias = record.defaultAlias === true;
	record.lastVerifiedAt = Number(record.lastVerifiedAt || Date.now());
	record.source = 'awtsmoos-api';
	return record;
}

export class AliasMemory {
	constructor(storage = globalThis.localStorage) {
		this.storage = storage;
	}

	load() {
		try {
			const value = JSON.parse(this.storage?.getItem(MEMORY_KEY) || 'null');
			return value?.version === 1 ? publicRecord(value) : null;
		} catch {
			return null;
		}
	}

	save(value) {
		try {
			this.storage?.setItem(MEMORY_KEY, JSON.stringify(publicRecord(value)));
			return true;
		} catch {
			return false;
		}
	}

	clear() {
		try {
			this.storage?.removeItem(MEMORY_KEY);
			return true;
		} catch {
			return false;
		}
	}
}

export {
	MEMORY_KEY,
	ALLOWED_FIELDS,
	publicRecord
};
