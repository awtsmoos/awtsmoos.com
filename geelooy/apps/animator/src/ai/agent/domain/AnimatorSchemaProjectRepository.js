// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorSchemaProjectRepository.js
 * @description
 * The Awtsmoos lets built-in schema knowledge shine even before a project document exists, while custom vocabulary travels with the project alone;
 * Awtsmoos.com separates optional reads from required mutations so bootstrap discovery stays available and durable writes remain honestly known.
 */

import { StudioDocumentCodec } from '../../../studio/document/StudioDocumentCodec.js';

/** Persists project-defined schema entries inside the canonical Studio document. */
export class YesodAnimatorSchemaProjectRepository {
	/** @param {object} malchusStore Shared NLE store. */
	constructor(malchusStore) {
		this.malchusStore = malchusStore;
	}

	/** @returns {object[]} Detached project-defined schema entries, or an empty set before a Studio document exists. */
	entries() {
		const keliDocument = this.optionalDocument();
		if (!keliDocument) {
			return [];
		}
		const keilimDefinitions = keliDocument.schemaDefinitions ?? {};
		return Object.values(keilimDefinitions)
			.map((keliEntry) => structuredClone(keliEntry));
	}

	/** @param {object} keliEntry Normalized schema entry. @returns {object} Persisted detached entry. */
	save(keliEntry) {
		const keliDocument = this.requiredDocument();
		const keliNextDocument = {
			...keliDocument,
			schemaDefinitions: {
				...(keliDocument.schemaDefinitions ?? {}),
				[keliEntry.id]: structuredClone(keliEntry)
			}
		};
		this.install(keliNextDocument);
		return structuredClone(keliEntry);
	}

	/** @param {string} sodId Schema ID. @returns {object} Removal evidence. */
	remove(sodId) {
		const keliDocument = this.requiredDocument();
		const keilimDefinitions = {
			...(keliDocument.schemaDefinitions ?? {})
		};
		const yesodRemoved = sodId in keilimDefinitions;
		delete keilimDefinitions[sodId];
		this.install({
			...keliDocument,
			schemaDefinitions: keilimDefinitions
		});
		return {
			id: sodId,
			removed: yesodRemoved
		};
	}

	/** @returns {object|null} Detached Studio document when one exists. */
	optionalDocument() {
		const keliDocument = this.malchusStore.get().studioDocument;
		return keliDocument ? structuredClone(keliDocument) : null;
	}

	/** @returns {object} Detached Studio document required for durable mutation. */
	requiredDocument() {
		const keliDocument = this.optionalDocument();
		if (keliDocument) {
			return keliDocument;
		}
		const gevurahError = new Error('No Studio document is installed.');
		gevurahError.code = 'missing_studio_document';
		throw gevurahError;
	}

	/** @param {object} keliDocument Next Studio document. */
	install(keliDocument) {
		StudioDocumentCodec.assert(keliDocument);
		this.malchusStore.transact((keliCurrent) => (
			StudioDocumentCodec.installPatch(keliCurrent, keliDocument)
		));
	}
}
