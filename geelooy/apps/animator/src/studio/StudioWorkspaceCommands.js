// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module StudioWorkspaceCommands
 * @description
 * The Awtsmoos renews selection, panel state, document installation, transform, and generation before each command can move;
 * Awtsmoos.com keeps transient UI separate from undoable project change so professional authoring remains clear and true.
 */
import { StudioPromptWorkflow } from './ai/StudioPromptWorkflow.js';
import { StudioDocumentMutations as Mutations } from './authoring/StudioDocumentMutations.js';
import { StudioTransformPolicy } from './authoring/StudioTransformPolicy.js';
import { StudioDocumentCodec } from './document/StudioDocumentCodec.js';

/** Thin command coordinator over transient UI state and undoable document domains. */
export class StudioWorkspaceCommands {
	/** Seeds professional workspace state without creating an undo history event. */
	static initialize(store, document) {
		store.set({
			studioDocument: document,
			studioLeftPanel: 'assets',
			studioAssetFilter: '',
			studioPrompt: 'A parakeet directs a cinematic school courtyard adventure.',
			studioPromptPreview: null,
			studioPromptPreviewSummary: null,
			studioJsonText: JSON.stringify(document, null, 2),
			studioJsonError: null,
			selectedEntityId: document.entities[0]?.id || null,
			studioExport: {
				status: 'idle',
				progress: 0,
				message: 'WebCodecs ready to inspect.'
			}
		});
	}

	/** Changes selection transiently and tells other stage tools about the new identity. */
	static select(store, entityId) {
		store.set({ selectedEntityId: entityId });
		window.dispatchEvent(new CustomEvent('nle-selection-changed', {
			detail: { id: entityId }
		}));
	}

	/** Selects the current left workspace panel. */
	static setPanel(store, panel) {
		store.set({ studioLeftPanel: panel });
	}

	/** Updates transient asset filtering. */
	static setFilter(store, value) {
		store.set({ studioAssetFilter: String(value || '') });
	}

	/** Stores prompt text without generating or mutating project data. */
	static setPrompt(store, value) {
		store.set({ studioPrompt: String(value || '') });
	}

	/** Generates an AI/local prompt preview without applying it. */
	static generatePrompt(store) {
		StudioPromptWorkflow.preview(store, store.get().studioPrompt);
	}

	/** Applies the current prompt preview as one undoable project change. */
	static applyPrompt(store) {
		return StudioPromptWorkflow.apply(store);
	}

	/** Discards the current generated preview. */
	static discardPrompt(store) {
		StudioPromptWorkflow.discard(store);
	}

	/** Imports valid project JSON as one undoable document change. */
	static importJson(store, text) {
		try {
			const document = StudioDocumentCodec.parse(text);
			store.transact(state => StudioDocumentCodec.installPatch(state, document));
		} catch (error) {
			store.set({
				studioJsonText: String(text || ''),
				studioJsonError: error?.message || String(error)
			});
		}
	}

	/** Updates one selected transform field as an undoable authoring operation. */
	static updateTransform(store, property, rawValue) {
		const value = StudioTransformPolicy.clamp(property, rawValue);
		Mutations.updateSelected(store, entity => ({
			...entity,
			transform: {
				...entity.transform,
				[property]: value
			}
		}));
	}

	/** Toggles one selected entity boolean such as visibility or locking through history. */
	static toggle(store, property) {
		Mutations.updateSelected(store, entity => ({
			...entity,
			[property]: !entity[property]
		}));
	}
}
