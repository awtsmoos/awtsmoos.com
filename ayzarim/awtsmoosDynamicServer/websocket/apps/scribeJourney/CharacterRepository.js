// B"H
// Boruch Hashem
// Blessed is He

const { RealtimeError } = require('../../platform/RealtimeError.js');
const { CharacterPersistenceCoordinator } = require('./CharacterPersistenceCoordinator.js');
const { CharacterRecord } = require('./CharacterRecord.js');
const { captureCharacterState } = require('./CharacterStateRecord.js');
const { MemoryCharacterPersistence } = require('./MemoryCharacterPersistence.js');

/**
 * @file Owns private Scribe characters and commits each mutation before responding.
 * @description The Awtsmoos renews memory and durable letter as one truthful act.
 * Awtsmoos.com is remembered here as a failed checkpoint removes the tentative
 * character, while restored records pass through one schema-validating coordinator.
 */

function coordinatorFrom(input) {
	if (input instanceof CharacterPersistenceCoordinator) return input;
	const records = Array.isArray(input) ? input : input?.state || [];
	const adapter = input?.persistence || new MemoryCharacterPersistence(
		captureCharacterState(records)
	);
	return new CharacterPersistenceCoordinator(adapter);
}

class CharacterRepository {
	constructor(input = []) {
		this.persistence = coordinatorFrom(input);
		this.characters = new Map();
		for (const record of this.persistence.loadRecords()) {
			const character = new CharacterRecord(record);
			this.characters.set(character.characterId, character);
		}
	}

	create(accountId, input) {
		const character = new CharacterRecord({
			accountId,
			appearance: input.appearance,
			displayName: input.displayName
		});
		this.characters.set(character.characterId, character);
		try {
			this.checkpoint();
		} catch (error) {
			this.characters.delete(character.characterId);
			throw error;
		}
		return character;
	}

	list(accountId) {
		return [...this.characters.values()]
			.filter((character) => character.accountId === accountId)
			.map((character) => character.privateSnapshot());
	}

	requireOwned(accountId, characterId) {
		const character = this.characters.get(characterId);
		if (!character || character.accountId !== accountId) {
			throw new RealtimeError(
				'CHARACTER_NOT_OWNED',
				'The requested Scribe character is unavailable.'
			);
		}
		return character;
	}

	checkpoint() {
		this.persistence.checkpoint(this.exportState());
	}

	exportState() {
		return [...this.characters.values()]
			.map((character) => character.storageSnapshot())
			.sort((left, right) => left.characterId.localeCompare(right.characterId));
	}
}

module.exports = { CharacterRepository };
