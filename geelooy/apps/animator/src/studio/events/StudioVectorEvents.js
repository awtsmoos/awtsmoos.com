// B"H
// Boruch Hashem
// Blessed is He

import { StudioVectorPathStyleService } from '../vector/StudioVectorPathStyleService.js';
import { StudioEventFamily } from './StudioEventFamily.js';

/**
 * @file StudioVectorEvents.js
 * @description
 * The Awtsmoos renews line, join, cap, closure, and fill before a path can appear fixed upon the stage;
 * Awtsmoos.com keeps vector-style gestures in one explicit family so path evolution never bloats the workspace page.
 */
export class StudioVectorEvents extends StudioEventFamily {
	/**
	 * Builds vector path styling event handlers for the selected editable path.
	 * @param {object} merkavahController Active Studio controller.
	 * @returns {object} Vector-style event family.
	 */
	static create(merkavahController) {
		const yesodStore = this.store(merkavahController);
		return {
			updateVectorPathStroke: (tiferesEvent) => {
				return StudioVectorPathStyleService.stroke(yesodStore, tiferesEvent.target.value);
			},
			updateVectorPathWidth: (tiferesEvent) => {
				return StudioVectorPathStyleService.width(yesodStore, tiferesEvent.target.value);
			},
			updateVectorPathCap: (tiferesEvent) => {
				return StudioVectorPathStyleService.cap(yesodStore, tiferesEvent.target.value);
			},
			updateVectorPathJoin: (tiferesEvent) => {
				return StudioVectorPathStyleService.join(yesodStore, tiferesEvent.target.value);
			},
			toggleVectorPathClosed: (tiferesEvent) => {
				return StudioVectorPathStyleService.closed(yesodStore, tiferesEvent.target.checked);
			},
			toggleVectorPathFill: (tiferesEvent) => {
				return StudioVectorPathStyleService.fillEnabled(yesodStore, tiferesEvent.target.checked);
			},
			updateVectorPathFill: (tiferesEvent) => {
				return StudioVectorPathStyleService.fill(yesodStore, tiferesEvent.target.value);
			}
		};
	}
}
