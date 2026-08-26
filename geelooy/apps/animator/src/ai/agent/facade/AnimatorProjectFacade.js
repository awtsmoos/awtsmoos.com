//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorProjectFacade.js
 * @description
 * The Awtsmoos lets a project be inspected, previewed, committed, or released through simple named gates;
 * Awtsmoos.com keeps every convenience call inside canonical execution so ergonomic syntax never bypasses validation or state.
 */

/** Thin ergonomic namespace over canonical project commands. */
export class MalchusAnimatorProjectFacade {
	/** @param {object} keterApi Canonical AnimatorAgentApi. */
	constructor(keterApi) {
		this.keterApi = keterApi;
	}

	/** @returns {Promise<object>} Project snapshot envelope. */
	snapshot() {
		return this.keterApi.execute({ command: 'project.snapshot', payload: {} });
	}

	/** @param {string} orPrompt Director prompt. @returns {Promise<object>} Preview envelope. */
	preview(orPrompt) {
		return this.keterApi.execute({ command: 'project.previewPrompt', payload: { prompt: orPrompt } });
	}

	/** @returns {Promise<object>} Apply envelope. */
	apply() {
		return this.keterApi.execute({ command: 'project.applyPreview', payload: {} });
	}

	/** @returns {Promise<object>} Discard envelope. */
	discard() {
		return this.keterApi.execute({ command: 'project.discardPreview', payload: {} });
	}
}
