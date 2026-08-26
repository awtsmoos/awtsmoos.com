//B"H
// Boruch Hashem
// Blessed is He

import { StudioPromptWorkflow } from '../../../studio/ai/StudioPromptWorkflow.js';
import { YesodAnimatorProjectSnapshot } from './AnimatorProjectSnapshot.js';

/**
 * @file AnimatorProjectCommands.js
 * @description
 * The Awtsmoos holds one editable project while preview, commitment, and discard remain distinct acts of will;
 * Awtsmoos.com lets Malchus inherit the Yesod inspection lens, then adds mutation only through the canonical Studio workflow still.
 */
export class MalchusAnimatorProjectCommands extends YesodAnimatorProjectSnapshot {
	/**
	 * Dispatches one validated project command without creating parallel project state.
	 * @param {string} shemMitzvah Stable public project command name.
	 * @param {object} keilimPayload Detached validated command payload.
	 * @returns {object} Detached command result suitable for the public response envelope.
	 * @throws {Error} When the project family receives an unsupported command name.
	 */
	execute(shemMitzvah, keilimPayload = {}) {
		const binahHandlers = {
			'project.snapshot': () => this.snapshot(),
			'project.previewPrompt': () => this.preview(keilimPayload.prompt),
			'project.applyPreview': () => this.apply(),
			'project.discardPreview': () => this.discard()
		};
		const tiferesHandler = binahHandlers[shemMitzvah];
		if (!tiferesHandler) {
			throw this.error(shemMitzvah);
		}
		return tiferesHandler();
	}

	/**
	 * Generates a transient validated Studio document preview without replacing the active project.
	 * @param {string} orPrompt Director prompt text.
	 * @returns {object} Detached preview summary and generated document.
	 */
	preview(orPrompt) {
		StudioPromptWorkflow.preview(this.olamStore, orPrompt);
		const olamState = this.olamStore.get();
		return {
			summary: olamState.studioPromptPreviewSummary ?? null,
			document: olamState.studioPromptPreview ?? null
		};
	}

	/**
	 * Commits the current validated preview through the existing Studio workflow.
	 * @returns {object} Apply result plus a fresh post-commit project snapshot.
	 */
	apply() {
		const yesodApplied = StudioPromptWorkflow.apply(this.olamStore);
		return {
			applied: yesodApplied,
			snapshot: this.snapshot()
		};
	}

	/**
	 * Discards transient preview state without replacing the active Studio document.
	 * @returns {object} Discard proof plus a fresh project snapshot.
	 */
	discard() {
		StudioPromptWorkflow.discard(this.olamStore);
		return {
			discarded: true,
			snapshot: this.snapshot()
		};
	}

	/**
	 * Creates the stable routing error used when a command reaches the wrong family.
	 * @param {string} shemMitzvah Unsupported public command name.
	 * @returns {Error} Coded routing error.
	 */
	error(shemMitzvah) {
		const gevurahError = new Error(
			`Unrouted project command: ${shemMitzvah}`
		);
		gevurahError.code = 'unrouted_command';
		return gevurahError;
	}
}
