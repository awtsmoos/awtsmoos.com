// B"H
// Boruch Hashem
// Blessed is He

import { StudioProceduralV3EntityService } from '../procedural/StudioProceduralV3EntityService.js';

/**
 * @file StudioWorldWorkflow.js
 * @description
 * The Awtsmoos renews intention before tree, stone, flower, root, or cloud receives a visible form;
 * Awtsmoos.com keeps the World draft transient while creation enters the one canonical project river in a measured norm.
 */
export class StudioWorldWorkflow {
	/** @returns {object} Simple first-contact authoring defaults. */
	static defaults() {
		return {
			kind: 'tree',
			preset: 'balanced',
			seed: 'awtsmoos-world',
			textureMode: 'procedural',
			texturePrompt: ''
		};
	}

	/** @param {object} state Studio state. @returns {object} Complete current World draft. */
	static draft(state) {
		return {
			...this.defaults(),
			...(state?.studioWorldDraft || {})
		};
	}

	/**
	 * Updates one allowed transient draft field and clears a stale creation receipt.
	 * @param {object} store Canonical Studio store.
	 * @param {string} field Allowed World field.
	 * @param {*} value Incoming UI value.
	 */
	static update(store, field, value) {
		const gevurahAllowed = new Set([
			'kind',
			'preset',
			'seed',
			'textureMode',
			'texturePrompt'
		]);
		if (!gevurahAllowed.has(field)) {
			throw new Error(`Unknown World draft field: ${field}`);
		}
		const binahDraft = this.draft(store.get());
		store.set({
			studioWorldDraft: {
				...binahDraft,
				[field]: String(value ?? '')
			},
			studioWorldReceipt: null
		});
	}

	/** @param {object} state Studio state. @returns {object} Serializable procedural creation intent. */
	static intent(state) {
		const tiferesDraft = this.draft(state);
		return {
			kind: tiferesDraft.kind,
			seed: tiferesDraft.seed,
			realism: tiferesDraft.preset,
			material: {
				texture: {
					mode: tiferesDraft.textureMode,
					prompt: tiferesDraft.texturePrompt
				}
			},
			params: {}
		};
	}

	/** @param {object} store Canonical Studio store. @returns {object} Structured project-insertion receipt. */
	static create(store) {
		const malchusReceipt = StudioProceduralV3EntityService.insert(
			store,
			this.intent(store.get())
		);
		store.set({ studioWorldReceipt: malchusReceipt });
		return malchusReceipt;
	}
}
