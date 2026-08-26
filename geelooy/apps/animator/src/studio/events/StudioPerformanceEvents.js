// B"H
// Boruch Hashem
// Blessed is He

import { StudioPerformanceWorkflow } from '../performance/StudioPerformanceWorkflow.js';
import { StudioEventFamily } from './StudioEventFamily.js';

/**
 * @file StudioPerformanceEvents.js
 * @description
 * The Awtsmoos renews voice, breath, gaze, and gesture before one DOM event can pretend to contain a performance;
 * Awtsmoos.com keeps Acting event semantics in one inheriting vessel so the workspace composes power without learning every inner cadence.
 */
export class StudioPerformanceEvents extends StudioEventFamily {
	/**
	 * Builds the complete Performance Lab event family against the canonical Studio controller.
	 * @param {object} merkavahController Active Studio workspace controller.
	 * @returns {object} Declarative Acting event family.
	 */
	static create(merkavahController) {
		const yesodStore = this.store(merkavahController);
		return {
			updatePerformanceField: (tiferesEvent) => {
				StudioPerformanceWorkflow.update(
					yesodStore,
					tiferesEvent.target.dataset.performanceField,
					tiferesEvent.target.value
				);
			},
			samplePerformance: () => {
				return StudioPerformanceWorkflow.sample(yesodStore);
			},
			openPerformancePanel: () => {
				this.openLeftPanel(merkavahController, 'performance');
			}
		};
	}
}
