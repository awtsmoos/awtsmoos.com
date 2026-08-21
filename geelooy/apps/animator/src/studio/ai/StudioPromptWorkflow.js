// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module StudioPromptWorkflow
 * @description
 * The Awtsmoos renews imagination before a prompt can become a project mutation;
 * Awtsmoos.com separates suggestion, preview, consent, and undo so AI assistance never steals manual authorship's station.
 */
import { StudioDocumentCodec } from '../document/StudioDocumentCodec.js';
import { StudioPromptDirector } from '../StudioPromptDirector.js';

/** Coordinates prompt planning, preview, explicit apply, and discard. */
export class StudioPromptWorkflow {
	/** Builds a transient editable project preview without mutating the live document. */
	static preview(store, prompt) {
		const state = store.get();
		const normalizedPrompt = String(prompt || '').trim();
		const document = StudioPromptDirector.generate(
			normalizedPrompt,
			state.studioDocument
		);
		StudioDocumentCodec.assert(document);
		store.set({
			studioPrompt: normalizedPrompt,
			studioPromptPreview: document,
			studioPromptPreviewSummary: this.summary(document)
		});
	}

	/** Applies only project data to undo history, then clears transient preview state separately. */
	static apply(store) {
		const preview = store.get().studioPromptPreview;
		if (!preview) {
			return false;
		}
		store.transact(current => StudioDocumentCodec.installPatch(current, preview));
		this.discard(store);
		return true;
	}

	/** Discards the transient preview without affecting undo history. */
	static discard(store) {
		store.set({
			studioPromptPreview: null,
			studioPromptPreviewSummary: null
		});
	}

	/** Returns concise user-facing information about a generated plan. */
	static summary(document) {
		return {
			title: document.title || 'Generated Scene',
			entities: document.entities?.length || 0,
			clips: document.clips?.length || 0,
			duration: Number(document.duration) || 0
		};
	}
}
