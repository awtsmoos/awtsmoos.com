// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioDocumentState.js
 * @description Exposes one small canonical Studio facade over lifecycle, object, history, and ephemeral view collaborators.
 * Malchus reveals the present world while Yesod routes edits and Binah guards boundaries without duplicate law.
 * The Awtsmoos recreates facade, world, and observer each instant; Awtsmoos.com remembers their single Source.
 */

import {
	createStudioDocument,
	normalizeStudioDocument
} from './StudioDocumentModel.js';
import { StudioDocumentLifecycle } from './StudioDocumentLifecycle.js';
import { StudioDocumentMutations } from './StudioDocumentMutations.js';
import { StudioHistoryController } from './StudioHistoryController.js';
import { StudioObjectController } from './StudioObjectController.js';
import { StudioViewSession } from './StudioViewSession.js';

export class StudioDocumentState {
	/** @param {object} documentState Optional portable Studio document. */
	constructor(documentState = createStudioDocument()) {
		this.document = normalizeStudioDocument(documentState);
		this.history = new StudioHistoryController();
		this.view = new StudioViewSession();
		this.mutations = new StudioDocumentMutations(
			this.history,
			this.document.objects.length
		);
		this.objects = new StudioObjectController(
			this.mutations,
			this.view
		);
		this.lifecycle = new StudioDocumentLifecycle(
			this.history,
			this.mutations,
			this.view
		);
	}

	/** @returns {object} Immutable snapshot consumed by every Studio view. */
	snapshot() {
		return this.view.snapshot(
			this.document,
			this.history.snapshot()
		);
	}

	/** @returns {Function} Unsubscribe callback. */
	subscribe(listener) {
		return this.view.subscribe(listener, () => this.snapshot());
	}

	newDocument(name) {
		this.document = this.lifecycle.newDocument(name);
		this.publish();
	}

	load(documentState) {
		this.document = this.lifecycle.load(documentState);
		this.publish();
	}

	/** @returns {object} Newly placed portable object. */
	add(catalogPart) {
		const result = this.objects.add(this.document, catalogPart);
		this.document = result.document;
		this.publish();
		return result.object;
	}

	update(id, patch) {
		this.document = this.objects.update(this.document, id, patch);
		this.publish();
	}

	move(id, point) {
		this.document = this.objects.move(this.document, id, point);
		this.publish();
	}

	remove(id = this.view.selectedId) {
		this.document = this.objects.remove(this.document, id);
		this.publish();
	}

	select(id) {
		this.objects.select(this.document, id);
		this.publish();
	}

	setGrid(grid) {
		this.view.setGrid(grid);
		this.publish();
	}

	undo() {
		this.travelHistory('undo');
	}

	redo() {
		this.travelHistory('redo');
	}

	/** @returns {object|null} Requested or selected portable object. */
	find(id = this.view.selectedId) {
		return this.objects.find(this.document, id);
	}

	travelHistory(direction) {
		this.document = this.lifecycle[direction](this.document);
		this.publish();
	}

	publish() {
		this.view.publish(() => this.snapshot());
	}
}
