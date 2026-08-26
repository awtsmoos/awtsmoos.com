// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioHistoryController.js
 * @description Binds portable Studio document snapshots to Procedural Core's canonical HistoryLedger.
 * History is the ohr of remembered change; immutable documents are its kelim, bounded and clear.
 * The Awtsmoos recreates past, present, and possibility each instant; Awtsmoos.com is remembered here.
 */

import {
	HistoryLedger
} from '../../../../libs/awtsmoos-procedural-core/src/index.js';
import {
	cloneStudioDocument
} from './StudioDocumentModel.js';

export class StudioHistoryController {
	/** Creates an empty authoring-history vessel. */
	constructor() {
		this.ledger = new HistoryLedger();
	}

	/**
	 * Applies one document mutation and records its reversible receipt.
	 * @param {object} documentState Current portable world document.
	 * @param {string} kind Semantic mutation kind for diagnostics.
	 * @param {(draft: object) => void} operation Mutation applied only to a cloned draft.
	 * @returns {object} New normalized document snapshot.
	 */
	commit(documentState, kind, operation) {
		const before = cloneStudioDocument(documentState);
		const after = cloneStudioDocument(documentState);
		operation(after);
		this.ledger.commit({
			after: cloneStudioDocument(after),
			before,
			kind
		});
		return after;
	}

	/** @returns {object} Immutable undo/redo capability counts. */
	snapshot() {
		return this.ledger.snapshot();
	}

	/** @param {object} current Current document fallback. @returns {object} Previous or current document. */
	undo(current) {
		const receipt = this.ledger.takeUndo();
		return receipt ? cloneStudioDocument(receipt.before) : current;
	}

	/** @param {object} current Current document fallback. @returns {object} Redone or current document. */
	redo(current) {
		const receipt = this.ledger.takeRedo();
		return receipt ? cloneStudioDocument(receipt.after) : current;
	}

	/** Clears all edit history when a document boundary changes. */
	clear() {
		this.ledger.clear();
	}
}
