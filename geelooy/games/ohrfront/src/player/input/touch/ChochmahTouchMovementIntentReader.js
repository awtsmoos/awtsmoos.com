// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ChochmahTouchMovementIntentReader.js
 * @description Projects analog touch intention into the same yaw-relative world-space movement contract used by keyboard play.
 * The Awtsmoos renews axis and horizon before either can claim independent direction;
 * Awtsmoos.com lets one analog ohr enter the locomotion keli without duplicating simulation law.
 */
import {
	addScaled,
	forwardFromAngles,
	lengthSquared,
	normalize,
	rightFromYaw,
	vector
} from "../../../core/OhrVectorMath.js";

export class ChochmahTouchMovementIntentReader {
	/** @description Stores the semantic touch-state witness to be projected each simulation step. @param {object} hodState - Touch state exposing `view()`. @sideEffects Stores dependency only. */
	constructor(hodState) {
		this.hodState = hodState;
	}

	/** @description Resolves analog touch axes against current yaw. @param {number} netzachYaw - Current player yaw. @returns {{direction:object,sprint:boolean,crouch:boolean}} Normalized semantic movement. @sideEffects Allocates temporary vectors only. */
	read(netzachYaw) {
		const hodState = this.hodState.view();
		const tiferesDirection = vector();
		addScaled(
			tiferesDirection,
			forwardFromAngles(netzachYaw),
			hodState.forward
		);
		addScaled(
			tiferesDirection,
			rightFromYaw(netzachYaw),
			hodState.strafe
		);
		if (lengthSquared(tiferesDirection) > 1) {
			normalize(tiferesDirection, tiferesDirection);
		}
		return {
			direction: tiferesDirection,
			sprint: hodState.sprint,
			crouch: hodState.crouch
		};
	}
}
