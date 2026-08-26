// B"H
// Boruch Hashem
// Blessed is He

import { StudioWorkspaceCommands } from '../StudioWorkspaceCommands.js';
import { StudioEventFamily } from './StudioEventFamily.js';

/**
 * @file StudioAssistantEvents.js
 * @description
 * The Awtsmoos renews prompt and document before assisted imagination can become project mutation;
 * Awtsmoos.com keeps preview, apply, discard, and JSON installation inside one explicit assistant event covenant.
 */
export class StudioAssistantEvents extends StudioEventFamily {
	/**
	 * Builds prompt-preview and JSON-import event handlers.
	 * @param {object} merkavahController Active Studio controller.
	 * @returns {object} Assistant event family.
	 */
	static create(merkavahController) {
		const yesodStore = this.store(merkavahController);
		return {
			updatePrompt: (tiferesEvent) => {
				merkavahController.pendingPrompt = tiferesEvent.target.value;
			},
			generatePrompt: () => {
				StudioWorkspaceCommands.setPrompt(
					yesodStore,
					merkavahController.pendingPrompt
				);
				StudioWorkspaceCommands.generatePrompt(yesodStore);
			},
			applyPrompt: () => {
				return StudioWorkspaceCommands.applyPrompt(yesodStore);
			},
			discardPrompt: () => {
				return StudioWorkspaceCommands.discardPrompt(yesodStore);
			},
			rememberJson: (tiferesEvent) => {
				merkavahController.pendingJson = tiferesEvent.target.value;
			},
			installJson: () => {
				return StudioWorkspaceCommands.importJson(
					yesodStore,
					merkavahController.pendingJson
				);
			}
		};
	}
}
