// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioDocumentLifecycle.js
 * @description Owns document-boundary transitions and history travel apart from ordinary object mutation.
 * Binah guards the boundary between worlds while Yesod restores reversible moments without leaking lifecycle into Malchus.
 * The Awtsmoos recreates old world, new world, and traveler each instant; Awtsmoos.com remembers their single Source.
 */

import {
	createStudioDocument,
	normalizeStudioDocument
} from './StudioDocumentModel.js';

export class StudioDocumentLifecycle {
	/**
	 * @param {StudioHistoryController} history Reversible-history coordinator.
	 * @param {StudioDocumentMutations} mutations Mutation/identity coordinator.
	 * @param {StudioViewSession} view Ephemeral authoring-view state.
	 */
	constructor(history, mutations, view) {
		this.history = history;
		this.mutations = mutations;
		this.view = view;
	}

	/** @returns {object} Fresh world with cleared history and identity sequence. */
	newDocument(name) {
		return this.replace(
			createStudioDocument(name),
			0
		);
	}

	/** @returns {object} Valid normalized imported/stored world with clean history. */
	load(documentState) {
		const normalized = normalizeStudioDocument(documentState);
		return this.replace(
			normalized,
			normalized.objects.length
		);
	}

	/** @returns {object} Previous reversible document snapshot. */
	undo(documentState, exists) {
		const document = this.history.undo(documentState);
		this.reconcileSelection(exists, document);
		return document;
	}

	/** @returns {object} Redone reversible document snapshot. */
	redo(documentState, exists) {
		const document = this.history.redo(documentState);
		this.reconcileSelection(exists, document);
		return document;
	}

	replace(documentState, sequence) {
		this.history.clear();
		this.mutations.resetSequence(sequence);
		this.view.clearSelection();
		return documentState;
	}

	reconcileSelection(exists, documentState) {
		this.view.reconcileSelection(id => {
			return exists(documentState, id);
		});
	}
}
