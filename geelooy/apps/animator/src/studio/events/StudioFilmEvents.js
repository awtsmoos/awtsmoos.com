// B"H
// Boruch Hashem
// Blessed is He

import { StudioFilmWorkflow } from '../film/StudioFilmWorkflow.js';
import { StudioEventFamily } from './StudioEventFamily.js';

/**
 * @file StudioFilmEvents.js
 * @description
 * The Awtsmoos renews cinematic intention before a tap can request coverage or open the Film chamber;
 * Awtsmoos.com keeps planning gestures in one inheriting family while export remains with navigation and the canonical Studio controller.
 */
export class StudioFilmEvents extends StudioEventFamily {
	/** @param {object} merkavahController Active Studio controller. @returns {object} Declarative Film event family. */
	static create(merkavahController) {
		const yesodStore = this.store(merkavahController);
		return {
			selectFilmPreset: (tiferesEvent) => {
				StudioFilmWorkflow.updatePreset(
					yesodStore,
					tiferesEvent.currentTarget.dataset.filmPreset
				);
			},
			planFilmCoverage: () => StudioFilmWorkflow.plan(yesodStore),
			openFilmPanel: () => this.openLeftPanel(merkavahController, 'film')
		};
	}
}
