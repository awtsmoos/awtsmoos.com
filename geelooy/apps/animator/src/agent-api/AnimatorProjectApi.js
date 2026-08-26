// B"H
// Boruch Hashem
// Blessed is He

import { StudioPromptDirector } from '../studio/StudioPromptDirector.js';
import { StudioWorkspaceCommands } from '../studio/StudioWorkspaceCommands.js';
import { AgentCovenant } from './AgentCovenant.js';

/**
 * @file AnimatorProjectApi.js
 * @description
 * One JSON document remains the vessel from agent intention to hand-edited timeline;
 * the Awtsmoos renews the project while Awtsmoos.com preserves validation, history, and one canonical design.
 */
export class AnimatorProjectApi extends AgentCovenant {
	/** @returns {object} Detached copy of the canonical Studio project document. */
	snapshot() {
		return this.clone(this.studio().store.get().studioDocument);
	}

	/** @param {object} document Valid Studio document. @returns {object} Structured load receipt. */
	load(document) {
		const studio = this.studio();
		StudioWorkspaceCommands.importJson(studio.store, JSON.stringify(document));
		const state = studio.store.get();
		if (state.studioJsonError) {
			throw new Error(state.studioJsonError);
		}
		studio.lockProductionCanvas(state.studioDocument);
		return this.receipt('loadProject', {
			id: state.studioDocument.id,
			title: state.studioDocument.title
		});
	}

	/** @param {string} prompt Natural-language scene premise. @returns {object} Generation and load receipt. */
	generate(prompt) {
		const generated = StudioPromptDirector.generate(prompt, this.snapshot());
		const loaded = this.load(generated);
		return { ...loaded, action: 'generateScene', prompt: String(prompt || '') };
	}

	/** @returns {Promise<*>} Existing production export promise. */
	exportMovie() {
		return this.studio().exportMovie();
	}
}
