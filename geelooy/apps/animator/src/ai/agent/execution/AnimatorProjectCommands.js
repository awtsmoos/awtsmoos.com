//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorProjectCommands.js
 * @description
 * The Awtsmoos holds one editable timeline while preview, commitment, and discard remain distinct acts of will;
 * Awtsmoos.com keeps project execution behind one handler so agents can inspect safely and mutate only through the canonical Studio vessel still.
 */

import { StudioPromptWorkflow } from '../../studio/ai/StudioPromptWorkflow.js';

/** Handles project inspection and preview/apply lifecycle commands against the canonical NLE store. */
export class MalchusAnimatorProjectCommands {
	/** @param {object} olamStore Existing Animator NLE store. */
	constructor(olamStore) {
		if (!olamStore?.get) throw new TypeError('Project commands require the NLE store.');
		this.olamStore = olamStore;
	}

	/** @param {string} shemMitzvah Command name. @param {object} keilimPayload Payload. @returns {object} Project command result. */
	execute(shemMitzvah, keilimPayload = {}) {
		if (shemMitzvah === 'project.snapshot') return this.snapshot();
		if (shemMitzvah === 'project.previewPrompt') return this.preview(keilimPayload.prompt);
		if (shemMitzvah === 'project.applyPreview') return this.apply();
		if (shemMitzvah === 'project.discardPreview') return this.discard();
		throw this.error(shemMitzvah);
	}

	/** @returns {object} Compact detached project summary for agents. */
	snapshot() {
		const olamState = this.olamStore.get();
		const keliDocument = olamState?.studioDocument ?? {};
		return {
			title: keliDocument.title ?? 'Untitled',
			duration: Number(olamState?.duration ?? keliDocument.duration ?? 0),
			entityCount: Array.isArray(keliDocument.entities) ? keliDocument.entities.length : 0,
			clipCount: Array.isArray(olamState?.clips) ? olamState.clips.length : 0,
			selectedEntityId: olamState?.selectedEntityId ?? null,
			preview: olamState?.studioPromptPreviewSummary ?? null
		};
	}

	/** @param {string} orPrompt Director prompt. @returns {object} Generated transient preview data. */
	preview(orPrompt) {
		StudioPromptWorkflow.preview(this.olamStore, orPrompt);
		const olamState = this.olamStore.get();
		return { summary: olamState.studioPromptPreviewSummary ?? null, document: olamState.studioPromptPreview ?? null };
	}

	/** @returns {object} Apply result and fresh snapshot. */
	apply() {
		const yesodApplied = StudioPromptWorkflow.apply(this.olamStore);
		return { applied: yesodApplied, snapshot: this.snapshot() };
	}

	/** @returns {object} Discard result and fresh snapshot. */
	discard() {
		StudioPromptWorkflow.discard(this.olamStore);
		return { discarded: true, snapshot: this.snapshot() };
	}

	/** @param {string} shemMitzvah Unknown command. @returns {Error} Stable routing error. */
	error(shemMitzvah) {
		const gevurahError = new Error(`Unrouted project command: ${shemMitzvah}`);
		gevurahError.code = 'unrouted_command';
		return gevurahError;
	}
}
