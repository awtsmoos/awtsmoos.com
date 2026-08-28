// B"H
// Boruch Hashem
// Blessed is He

import { StudioProceduralAlgorithmRevision } from '../procedural/StudioProceduralAlgorithmRevision.js';
import { StudioProceduralV3TraitRegistry } from '../procedural/StudioProceduralV3TraitRegistry.js';

/**
 * @file StudioWorldDraft.js
 * @description
 * The Awtsmoos renews intention before store, event, or project mutation can claim to own the World;
 * Awtsmoos.com keeps draft normalization pure so UI and automation may shape rich nature without creating a shadow document or tangled swirl.
 */
export class StudioWorldDraft {
	static FIELDS = Object.freeze([
		'kind',
		'preset',
		'seed',
		'textureMode',
		'texturePrompt'
	]);

	/** @param {string} kind Initial kind. @returns {object} Complete simple-first World draft. */
	static defaults(kind = 'tree') {
		return {
			kind,
			preset: 'balanced',
			seed: 'awtsmoos-world',
			textureMode: 'procedural',
			texturePrompt: '',
			traits: StudioProceduralV3TraitRegistry.defaults(kind)
		};
	}

	/**
	 * Normalizes transient state into a complete kind-aware World draft.
	 * @param {object} state Current Studio state.
	 * @returns {object} Complete normalized draft.
	 */
	static fromState(state = {}) {
		const binahStored = state.studioWorldDraft || {};
		const tiferesKind = String(binahStored.kind || 'tree');
		const malchusDefault = this.defaults(tiferesKind);
		return {
			...malchusDefault,
			...binahStored,
			kind: tiferesKind,
			traits: StudioProceduralV3TraitRegistry.normalize(
				tiferesKind,
				binahStored.traits || malchusDefault.traits
			)
		};
	}

	/**
	 * Produces a new draft after changing one allowed top-level field.
	 * @param {object} draft Current normalized draft.
	 * @param {string} field Allowed field name.
	 * @param {*} value Incoming UI value.
	 * @returns {object} New normalized draft.
	 */
	static update(draft, field, value) {
		if (!this.FIELDS.includes(field)) {
			throw new Error(`Unknown World draft field: ${field}`);
		}
		const tiferesNext = {
			...draft,
			[field]: String(value ?? '')
		};
		if (field === 'kind') {
			tiferesNext.traits = StudioProceduralV3TraitRegistry.defaults(
				tiferesNext.kind
			);
		}
		return this.fromState({ studioWorldDraft: tiferesNext });
	}

	/**
	 * Produces a new draft after one verified kind-specific trait update.
	 * @param {object} draft Current normalized draft.
	 * @param {string} key Trait key.
	 * @param {*} value Raw numeric value.
	 * @returns {object} New normalized draft.
	 */
	static updateTrait(draft, key, value) {
		const gevurahKnown = StudioProceduralV3TraitRegistry.schema(draft.kind)
			.some((tiferesField) => tiferesField.key === key);
		if (!gevurahKnown) {
			throw new Error(`Unknown ${draft.kind} World trait: ${key}`);
		}
		return {
			...draft,
			traits: StudioProceduralV3TraitRegistry.normalize(
				draft.kind,
				{ ...draft.traits, [key]: value }
			)
		};
	}

	/** @param {object} draft Normalized draft. @returns {object} Serializable revision-two creation intent. */
	static intent(draft) {
		return {
			kind: draft.kind,
			seed: draft.seed,
			realism: draft.preset,
			algorithmRevision: StudioProceduralAlgorithmRevision.CURRENT,
			traits: draft.traits,
			material: {
				texture: {
					mode: draft.textureMode,
					prompt: draft.texturePrompt
				}
			},
			params: {}
		};
	}
}
