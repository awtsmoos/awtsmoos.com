//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorDocumentDomain.js
 * @description
 * The Awtsmoos lets one editable Studio document move between JSON, validation, present state, and undo-aware installation;
 * Awtsmoos.com reuses the canonical codec so no Agent mutation can invent a second document truth or bypass project restoration.
 */

import { StudioDocumentCodec } from '../../../studio/document/StudioDocumentCodec.js';

/** Adapts canonical Studio document codec operations to detached public Agent API results. */
export class BinahAnimatorDocumentDomain {
	/** @param {object} malchusStore Shared NLE store. */
	constructor(malchusStore) {
		this.malchusStore = malchusStore;
	}

	/** @returns {object|null} Detached current Studio document. */
	current() {
		const keliDocument = this.malchusStore.get().studioDocument ?? null;
		return keliDocument ? structuredClone(keliDocument) : null;
	}

	/** @param {object} keliDocument Candidate document. @returns {object} Validation proof. */
	validate(keliDocument) {
		StudioDocumentCodec.assert(keliDocument);
		return {
			valid: true,
			document: structuredClone(keliDocument)
		};
	}

	/** @param {string} orText Studio JSON. @returns {object} Parsed validated document. */
	parse(orText) {
		return structuredClone(StudioDocumentCodec.parse(orText));
	}

	/** @param {object|null} keliDocument Optional explicit document. @returns {object} JSON serialization. */
	serialize(keliDocument = null) {
		const keliSource = keliDocument ?? this.malchusStore.get().studioDocument;
		StudioDocumentCodec.assert(keliSource);
		return {
			text: JSON.stringify(keliSource, null, 2),
			document: structuredClone(keliSource)
		};
	}

	/** @param {object} keliDocument Valid Studio document. @returns {object} Install receipt. */
	install(keliDocument) {
		this.malchusStore.transact((keliCurrent) => (
			StudioDocumentCodec.installPatch(keliCurrent, keliDocument)
		));
		return {
			installed: true,
			document: this.current()
		};
	}
}
