// B"H

import { checksumFor } from './checksum.js';
import { GAME_ID, MAX_IMPORT_BYTES, SAVE_VERSION } from './constants.js';
import { inspectParsedSave } from './migrations.js';
import { selectProgress } from './progressSelector.js';
import { createSaveStore } from './saveStore.js';
import { validateProgress } from './validator.js';

function byteLength(text) {
	return new TextEncoder().encode(text).length;
}

function isoTimestamp(clock) {
	const value = clock();
	const date = value instanceof Date ? value : new Date(value);
	if (Number.isNaN(date.getTime())) throw new Error('The system clock returned an invalid time.');
	return date.toISOString();
}

function bodyFromDocument(document) {
	return {
		game: document.game,
		version: document.version,
		createdAt: document.createdAt,
		updatedAt: document.updatedAt,
		payload: document.payload
	};
}

function buildDocument(state, createdAt, updatedAt) {
	const body = {
		game: GAME_ID,
		version: SAVE_VERSION,
		createdAt,
		updatedAt,
		payload: selectProgress(state)
	};
	return { ...body, checksum: checksumFor(body) };
}

/**
 * Creates, validates, migrates, and recovers Chronicles without ever assigning
 * untrusted JSON directly into the living game state.
 */
export function createSaveService({ storage, clock = () => new Date(), createFreshState, maps, tileSize }) {
	const store = createSaveStore(storage);
	const validationOptions = { createFreshState, maps, tileSize };

	function decodeText(text) {
		if (typeof text !== 'string' || text.length === 0) throw new Error('Chronicle text is empty.');
		if (byteLength(text) > MAX_IMPORT_BYTES) throw new Error('Chronicle exceeds the safe import size.');
		let parsed;
		try {
			parsed = JSON.parse(text);
		} catch {
			throw new Error('Chronicle contains malformed JSON.');
		}
		const inspection = inspectParsedSave(parsed);
		if (inspection.kind === 'current') {
			const expected = checksumFor(bodyFromDocument(inspection.document));
			if (inspection.document.checksum !== expected) throw new Error('Chronicle integrity check failed.');
		}
		const validated = validateProgress(inspection.progress, validationOptions);
		return { ...validated, document: inspection.document, migrated: inspection.migrated };
	}

	function save(state) {
		const now = isoTimestamp(clock);
		const previousText = store.readPrimary();
		let validatedPrevious = null;
		let createdAt = now;
		if (previousText) {
			try {
				const previous = decodeText(previousText);
				validatedPrevious = previousText;
				createdAt = previous.document?.createdAt || now;
			} catch {
				validatedPrevious = null;
			}
		}
		const document = buildDocument(state, createdAt, now);
		const text = JSON.stringify(document);
		store.commit(text, validatedPrevious);
		return { text, bytes: byteLength(text), document, backedUp: Boolean(validatedPrevious) };
	}

	function load() {
		const failures = [];
		for (const candidate of store.readCandidates()) {
			try {
				const result = decodeText(candidate.text);
				if (candidate.source !== 'primary' || result.migrated) {
					try { save(result.state); } catch (error) { result.warnings.push(`Recovery loaded, but repair write failed: ${error.message}`); }
				}
				return { ...result, source: candidate.source };
			} catch (error) {
				failures.push(`${candidate.source}: ${error.message}`);
			}
		}
		throw new Error(failures.length ? failures.join(' | ') : 'No Chronicle was found.');
	}

	function exportState(state) {
		const now = isoTimestamp(clock);
		const document = buildDocument(state, now, now);
		const text = JSON.stringify(document, null, 2);
		return { text, bytes: byteLength(text), document };
	}

	function importText(text) {
		return decodeText(text);
	}

	return { decodeText, exportState, importText, load, save };
}
