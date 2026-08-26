// B"H
// Boruch Hashem
// Blessed is He

import { StudioProceduralCommands } from '../procedural/StudioProceduralCommands.js';
import { StudioEventFamily } from './StudioEventFamily.js';

/**
 * @file StudioProceduralEvents.js
 * @description
 * The Awtsmoos renews deterministic seed and form before regeneration can seem to repeat a prior world;
 * Awtsmoos.com keeps procedural lifecycle gestures version-aware through one narrow event vessel for v2 and v3 alike.
 */
export class StudioProceduralEvents extends StudioEventFamily {
	/**
	 * Builds parameter, seed, regeneration, reset, and freeze event handlers.
	 * @param {object} merkavahController Active Studio controller.
	 * @returns {object} Procedural lifecycle event family.
	 */
	static create(merkavahController) {
		const yesodStore = this.store(merkavahController);
		return {
			updateProceduralParameter: (tiferesEvent) => {
				return StudioProceduralCommands.updateParameter(
					yesodStore,
					tiferesEvent.target.dataset.proceduralParam,
					tiferesEvent.target.value
				);
			},
			updateProceduralSeed: (tiferesEvent) => {
				return StudioProceduralCommands.updateSeed(
					yesodStore,
					tiferesEvent.target.value
				);
			},
			regenerateProcedural: () => {
				return StudioProceduralCommands.regenerate(yesodStore);
			},
			randomizeProceduralSeed: () => {
				return StudioProceduralCommands.randomizeSeed(yesodStore);
			},
			resetProcedural: () => {
				return StudioProceduralCommands.reset(yesodStore);
			},
			freezeProcedural: () => {
				return StudioProceduralCommands.freeze(yesodStore);
			}
		};
	}
}
