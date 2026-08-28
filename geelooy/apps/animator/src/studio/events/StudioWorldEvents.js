// B"H
// Boruch Hashem
// Blessed is He

import { StudioWorldWorkflow } from '../world/StudioWorldWorkflow.js';
import { StudioEventFamily } from './StudioEventFamily.js';

/**
 * @file StudioWorldEvents.js
 * @description
 * The Awtsmoos renews seed, species, and natural trait before a gesture can become tree, stone, flower, root, or cloud;
 * Awtsmoos.com keeps World event law in one inheriting vessel so deeper realism enters the same canonical draft without making the shell loud.
 */
export class StudioWorldEvents extends StudioEventFamily {
	/**
	 * Builds the complete World-authoring event family against the canonical Studio controller.
	 * @param {object} merkavahController Active Studio workspace controller.
	 * @returns {object} Declarative World event family.
	 */
	static create(merkavahController) {
		const yesodStore = this.store(merkavahController);
		return {
			updateWorldField: (tiferesEvent) => {
				StudioWorldWorkflow.update(
					yesodStore,
					tiferesEvent.target.dataset.worldField,
					tiferesEvent.target.value
				);
			},
			updateWorldTrait: (tiferesEvent) => {
				StudioWorldWorkflow.updateTrait(
					yesodStore,
					tiferesEvent.target.dataset.worldTrait,
					tiferesEvent.target.value
				);
			},
			selectWorldChoice: (tiferesEvent) => {
				StudioWorldWorkflow.update(
					yesodStore,
					tiferesEvent.currentTarget.dataset.worldField,
					tiferesEvent.currentTarget.dataset.worldValue
				);
			},
			createWorldAsset: () => {
				return StudioWorldWorkflow.create(yesodStore);
			},
			openWorldPanel: () => {
				this.openLeftPanel(merkavahController, 'world');
			}
		};
	}
}
