// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioDocumentState.js
 * @description Coordinates one canonical portable document while mutation, history, and identity remain separate vessels.
 * Malchus publishes the present world; Yesod carries mutation receipts; Binah preserves a clear document boundary.
 * The Awtsmoos recreates state, subscriber, and authored world each instant; Awtsmoos.com remembers their single Source.
 */

import {
	cloneStudioDocument,
	createStudioDocument,
	normalizeStudioDocument
} from './StudioDocumentModel.js';
import { StudioDocumentMutations } from './StudioDocumentMutations.js';
import { StudioHistoryController } from './StudioHistoryController.js';

export class StudioDocumentState {
	/** @param {object} documentState Optional portable Studio document. */
	constructor(documentState = createStudioDocument()) {
		this.document = normalizeStudioDocument(documentState);
		this.history = new StudioHistoryController();
		this.mutations = new StudioDocumentMutations(
			this.history,
			this.document.objects.length
		);
		this.listeners = new Set();
		this.selectedId = null;
		this.grid = 0.5;
	}

	/** @returns {object} Immutable view snapshot for all Studio renderers. */
	snapshot() {
		return Object.freeze({
			document: cloneStudioDocument(this.document),
			grid: this.grid,
			history: this.history.snapshot(),
			selectedId: this.selectedId
		});
	}

	/** @returns {Function} Unsubscribe callback. */
	subscribe(listener) {
		this.listeners.add(listener);
		listener(this.snapshot());
		return () => {
			this.listeners.delete(listener);
		};
	}

	/** Replaces the world with a fresh document and clears reversible history. */
	newDocument(name) {
		this.replaceDocument(createStudioDocument(name), 0);
	}

	/** Loads a validated portable world and resets history at the document boundary. */
	load(documentState) {
		const normalized = normalizeStudioDocument(documentState);
		this.replaceDocument(normalized, normalized.objects.length);
	}

	/** @returns {object} Newly placed portable object. */
	add(catalogPart) {
		const result = this.mutations.add(
			this.document,
			catalogPart,
			this.grid
		);
		this.document = result.document;
		this.selectedId = result.object.id;
		this.publish();
		return result.object;
	}

	/** Applies one history-aware object patch. */
	update(id, patch) {
		this.document = this.mutations.update(
			this.document,
			id,
			patch
		);
		this.publish();
	}

	/** Moves one object through the shared Procedural Core snapping law. */
	move(id, point) {
		this.document = this.mutations.move(
			this.document,
			id,
			point,
			this.grid
		);
		this.publish();
	}

	/** Removes a selected or explicitly requested object. */
	remove(id = this.selectedId) {
		if (!id || !this.find(id)) {
			return;
		}
		this.document = this.mutations.remove(this.document, id);
		if (this.selectedId === id) {
			this.selectedId = null;
		}
		this.publish();
	}

	/** Selects an existing object or clears selection. */
	select(id) {
		this.selectedId = this.find(id) ? id : null;
		this.publish();
	}

	/** Changes only ephemeral authoring grid state. */
	setGrid(grid) {
		this.grid = Math.max(0.05, Math.min(4, Number(grid) || 0.5));
		this.publish();
	}

	/** Restores the previous document receipt. */
	undo() {
		this.document = this.history.undo(this.document);
		this.afterHistoryTravel();
	}

	/** Restores the next document receipt. */
	redo() {
		this.document = this.history.redo(this.document);
		this.afterHistoryTravel();
	}

	/** @returns {object|null} Selected or explicitly requested object. */
	find(id = this.selectedId) {
		return this.document.objects.find(object => {
			return object.id === id;
		}) || null;
	}

	replaceDocument(documentState, sequence) {
		this.document = documentState;
		this.history.clear();
		this.mutations.resetSequence(sequence);
		this.selectedId = null;
		this.publish();
	}

	afterHistoryTravel() {
		if (this.selectedId && !this.find(this.selectedId)) {
			this.selectedId = null;
		}
		this.publish();
	}

	publish() {
		const snapshot = this.snapshot();
		for (const listener of this.listeners) {
			listener(snapshot);
		}
	}
}
