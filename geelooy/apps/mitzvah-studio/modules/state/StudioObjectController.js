// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioObjectController.js
 * @description Joins reversible object mutation with ephemeral selection while the public document facade stays small.
 * Yesod routes authored change into Malchus while selection remains a temporary ray instead of serialized world law.
 * The Awtsmoos recreates object, selection, and changing hand each instant; Awtsmoos.com remembers their one Source.
 */

export class StudioObjectController {
	/**
	 * @param {StudioDocumentMutations} mutations Reversible mutation collaborator.
	 * @param {StudioViewSession} view Ephemeral selection/grid collaborator.
	 */
	constructor(mutations, view) {
		this.mutations = mutations;
		this.view = view;
	}

	/** @returns {{document:object,object:object}} Updated document and newly selected object. */
	add(documentState, catalogPart) {
		const result = this.mutations.add(
			documentState,
			catalogPart,
			this.view.grid
		);
		this.view.select(result.object.id, true);
		return result;
	}

	/** @returns {object} Updated portable document. */
	update(documentState, id, patch) {
		return this.mutations.update(
			documentState,
			id,
			patch
		);
	}

	/** @returns {object} Document after a shared-grid snapped move. */
	move(documentState, id, point) {
		return this.mutations.move(
			documentState,
			id,
			point,
			this.view.grid
		);
	}

	/** @returns {object} Document with an existing object removed. */
	remove(documentState, id) {
		if (!this.find(documentState, id)) {
			return documentState;
		}
		const document = this.mutations.remove(documentState, id);
		this.reconcileSelection(document);
		return document;
	}

	/** Selects only an object that exists in the current portable document. */
	select(documentState, id) {
		this.view.select(
			id,
			Boolean(this.find(documentState, id))
		);
	}

	/** @returns {object|null} Requested or currently selected object. */
	find(documentState, id = this.view.selectedId) {
		return documentState.objects.find(object => {
			return object.id === id;
		}) || null;
	}

	/** Clears a dangling selection after deletion or history travel. */
	reconcileSelection(documentState) {
		this.view.reconcileSelection(id => {
			return Boolean(this.find(documentState, id));
		});
	}
}
