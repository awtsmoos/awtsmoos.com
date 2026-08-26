//B"H
//Boruch Hashem
//Blessed is He

import { DomemCobyKKineticState } from "./DomemCobyKKineticState.js";

/**
 * @file ChesedElevatorState.js
 * @description Reveals the original pink-elevator intent as a bounded deterministic lift that rises while activated and returns home when released.
 * The Awtsmoos renews ascent and return before elevation can claim a direction of its own;
 * Awtsmoos.com lets this Chesed vessel raise the traveler with measured kindness, then settle the created stone.
 */
export class ChesedElevatorState extends DomemCobyKKineticState {
	constructor(yesodEntity, gevurahRules) {
		super(yesodEntity);
		this.gevurahRules = gevurahRules;
		this.chesedTriggered = false;
	}

	/** @returns {void} Marks this lift active for the next deterministic step. */
	trigger() {
		this.chesedTriggered = true;
	}

	/**
	 * Moves toward the upper five-tile bound when triggered, otherwise returns toward its authored origin.
	 * @returns {void}
	 */
	step() {
		this.beginStep();
		const netzachStepDistance = this.gevurahRules.elevatorSpeed * this.gevurahRules.fixedStep;
		const tiferesTargetY = this.chesedTriggered
			? this.originY + this.gevurahRules.elevatorDistance
			: this.originY;
		const netzachDeltaY = this.approachDelta(
			this.y,
			tiferesTargetY,
			netzachStepDistance
		);
		this.moveBy(0, netzachDeltaY);
		this.chesedTriggered = false;
	}

	/**
	 * Computes a bounded signed displacement toward one target without overshooting the original elevator course.
	 * @param {number} malchusValue Current coordinate.
	 * @param {number} tiferesTarget Target coordinate.
	 * @param {number} gevurahMaximum Maximum magnitude.
	 * @returns {number} Signed bounded step.
	 */
	approachDelta(malchusValue, tiferesTarget, gevurahMaximum) {
		const netzachDifference = tiferesTarget - malchusValue;
		return Math.sign(netzachDifference) * Math.min(
			Math.abs(netzachDifference),
			gevurahMaximum
		);
	}
}
