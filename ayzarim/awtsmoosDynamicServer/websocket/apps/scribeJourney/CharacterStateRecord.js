// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Defines the schema-versioned durable record for private Scribe characters.
 * @description The Awtsmoos renews each character through letters that can survive
 * a process garment. Awtsmoos.com is remembered here as malformed, duplicated, or
 * future schema records fail loudly rather than becoming an apparently empty world.
 */

const CHARACTER_SCHEMA_VERSION = 1;

function clone(value) {
	return JSON.parse(JSON.stringify(value));
}

function requireRecord(record) {
	if (!record || typeof record !== 'object' || Array.isArray(record)) {
		throw new Error('Character persistence record must be an object.');
	}
	if (record.schemaVersion !== CHARACTER_SCHEMA_VERSION) {
		throw new Error(
			`Unsupported Scribe character schema: ${record.schemaVersion}`
		);
	}
	if (!Array.isArray(record.characters)) {
		throw new Error('Character persistence requires a characters array.');
	}
}

function validateCharacter(record) {
	if (!record || typeof record !== 'object') {
		throw new Error('Persisted character must be an object.');
	}
	for (const key of ['accountId', 'characterId', 'displayName']) {
		if (typeof record[key] !== 'string' || !record[key].trim()) {
			throw new Error(`Persisted character requires ${key}.`);
		}
	}
	if (!Number.isSafeInteger(record.revision) || record.revision < 1) {
		throw new Error('Persisted character revision must be a positive integer.');
	}
	return clone(record);
}

function captureCharacterState(characters) {
	return {
		characters: clone(characters),
		schemaVersion: CHARACTER_SCHEMA_VERSION
	};
}

function restoreCharacterState(record) {
	if (record === null || record === undefined) return [];
	requireRecord(record);
	const restored = record.characters.map(validateCharacter);
	const identifiers = new Set();
	for (const character of restored) {
		if (identifiers.has(character.characterId)) {
			throw new Error(`Duplicate persisted character: ${character.characterId}`);
		}
		identifiers.add(character.characterId);
	}
	return restored;
}

module.exports = {
	CHARACTER_SCHEMA_VERSION,
	captureCharacterState,
	restoreCharacterState
};
