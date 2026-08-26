// B"H
// Boruch Hashem
// Blessed is He

import { StudioAuthoringCommands } from '../authoring/StudioAuthoringCommands.js';
import { StudioEventFamily } from './StudioEventFamily.js';

/**
 * @file StudioAuthoringEvents.js
 * @description
 * The Awtsmoos renews rectangle, ellipse, text, nature, keyframe, layer, and undo before authored form enters history;
 * Awtsmoos.com keeps creation gestures in one family where pen deactivation and undo-safe commands remain explicit mysteries made clear.
 */
export class StudioAuthoringEvents extends StudioEventFamily {
	/**
	 * Builds creation, pen, layer-order, deletion, duplication, and history event handlers.
	 * @param {object} merkavahController Active Studio controller.
	 * @returns {object} Authoring event family.
	 */
	static create(merkavahController) {
		const yesodStore = this.store(merkavahController);
		const createOnce = (keterCallback) => {
			merkavahController.penTool?.deactivate();
			return keterCallback();
		};
		return {
			togglePenTool: () => {
				return merkavahController.penTool?.toggle();
			},
			finishPenPath: () => {
				return merkavahController.penTool?.finish();
			},
			cancelPenPath: () => {
				return merkavahController.penTool?.cancel();
			},
			addRectangle: () => {
				return createOnce(() => StudioAuthoringCommands.addRectangle(yesodStore));
			},
			addEllipse: () => {
				return createOnce(() => StudioAuthoringCommands.addEllipse(yesodStore));
			},
			addText: () => {
				return createOnce(() => StudioAuthoringCommands.addText(yesodStore));
			},
			addNature: (tiferesEvent) => {
				return createOnce(() => {
					return StudioAuthoringCommands.addNature(
						yesodStore,
						tiferesEvent.currentTarget.dataset.natureKind
					);
				});
			},
			addStudioKeyframe: () => {
				return StudioAuthoringCommands.addKeyframe(yesodStore);
			},
			duplicateSelected: () => {
				return StudioAuthoringCommands.duplicate(yesodStore);
			},
			removeSelected: () => {
				return StudioAuthoringCommands.remove(yesodStore);
			},
			moveLayerForward: () => {
				return StudioAuthoringCommands.moveForward(yesodStore);
			},
			moveLayerBackward: () => {
				return StudioAuthoringCommands.moveBackward(yesodStore);
			},
			undo: () => {
				return StudioAuthoringCommands.undo(yesodStore);
			},
			redo: () => {
				return StudioAuthoringCommands.redo(yesodStore);
			}
		};
	}
}
