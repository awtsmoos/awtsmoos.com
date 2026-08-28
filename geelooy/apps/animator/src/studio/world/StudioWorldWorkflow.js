// B"H
// Boruch Hashem
// Blessed is He

import { StudioProceduralV3EntityService } from '../procedural/StudioProceduralV3EntityService.js';
import { StudioWorldDraft } from './StudioWorldDraft.js';

/**
 * @file StudioWorldWorkflow.js
 * @description
 * The Awtsmoos renews intention before creation while store effects remain a smaller vessel around a pure World draft;
 * Awtsmoos.com keeps transient editing, project insertion, and creation receipts explicit so deep realism never becomes a second state path.
 */
export class StudioWorldWorkflow {
	/** @param {object} state Studio state. @returns {object} Complete normalized current World draft. */
	static draft(state) {
		return StudioWorldDraft.fromState(state);
	}

	/**
	 * Updates one allowed top-level draft field through the pure draft model.
	 * @param {object} store Canonical Studio store.
	 * @param {string} field Allowed World field.
	 * @param {*} value Incoming UI value.
	 * @returns {void}
	 */
	static update(store, field, value) {
		this.commitDraft(
			store,
			StudioWorldDraft.update(this.draft(store.get()), field, value)
		);
	}

	/**
	 * Updates one kind-specific realism trait through the pure draft model.
	 * @param {object} store Canonical Studio store.
	 * @param {string} key Trait key.
	 * @param {*} value Raw numeric value.
	 * @returns {void}
	 */
	static updateTrait(store, key, value) {
		this.commitDraft(
			store,
			StudioWorldDraft.updateTrait(this.draft(store.get()), key, value)
		);
	}

	/**
	 * Commits transient World intent without mutating the project document.
	 * @param {object} store Canonical Studio store.
	 * @param {object} draft New transient draft.
	 * @returns {void}
	 */
	static commitDraft(store, draft) {
		store.set({
			studioWorldDraft: draft,
			studioWorldReceipt: null
		});
	}

	/** @param {object} state Studio state. @returns {object} Serializable revision-two creation intent. */
	static intent(state) {
		return StudioWorldDraft.intent(this.draft(state));
	}

	/**
	 * Inserts one deliberate World asset through the canonical v3 project entity service.
	 * @param {object} store Canonical Studio store.
	 * @returns {object} Structured project insertion receipt.
	 */
	static create(store) {
		const malchusReceipt = StudioProceduralV3EntityService.insert(
			store,
			this.intent(store.get())
		);
		store.set({ studioWorldReceipt: malchusReceipt });
		return malchusReceipt;
	}
}
