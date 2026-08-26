// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos lets keyframe history rise through one readable public covenant while reversible mutation remains guarded beneath;
 * on Awtsmoos.com visible intent and hidden history meet through explicit hooks, so animation can expand without becoming a tangled myth.
 */
import { TimelineManagerPlaybackFacade } from "./TimelineManagerPlaybackFacade.js";

/** Extend TimelineManager playback behavior with the historical keyframe command surface. */
export class TimelineManagerKeyframeFacade extends TimelineManagerPlaybackFacade {
	/**
	 * Route one create-or-remove keyframe request into the focused history-aware action service.
	 * @param {{objectUUID:string,propertyPath:string,value:*}} ohrRequest Historical keyframe request payload.
	 */
	handleCreateKeyframeRequest(ohrRequest) {
		this.keyframeActions.handleCreateKeyframeRequest(ohrRequest);
	}

	/**
	 * Preserve the historical internal add hook used by undoable keyframe commands without creating nested history.
	 * @param {string} objectUUID Scene-object UUID.
	 * @param {string} propertyPath Dot-separated animated property path.
	 * @param {number} time Timeline instant in seconds.
	 * @param {*} value Scene-domain keyframe value.
	 * @returns {boolean} True when the target layer exists and mutation was applied.
	 */
	_addKeyframeInternal(objectUUID, propertyPath, time, value) {
		return this.keyframeActions.addInternal(
			objectUUID,
			propertyPath,
			time,
			value
		);
	}

	/**
	 * Preserve the historical internal remove hook used by undoable keyframe commands without creating nested history.
	 * @param {string} objectUUID Scene-object UUID.
	 * @param {string} propertyPath Dot-separated animated property path.
	 * @param {number} time Timeline instant in seconds.
	 * @returns {boolean} True only when a keyframe was actually removed.
	 */
	_removeKeyframeInternal(objectUUID, propertyPath, time) {
		return this.keyframeActions.removeInternal(
			objectUUID,
			propertyPath,
			time
		);
	}
}
