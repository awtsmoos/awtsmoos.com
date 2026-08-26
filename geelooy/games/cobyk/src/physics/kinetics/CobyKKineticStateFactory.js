//B"H
//Boruch Hashem
//Blessed is He

import { ChesedElevatorState } from "./ChesedElevatorState.js";
import { GevurahMovingSpikeState } from "./GevurahMovingSpikeState.js";
import { GevurahShrinkerState } from "./GevurahShrinkerState.js";

/**
 * @file CobyKKineticStateFactory.js
 * @description Creates only the three canonical CobyK kinetic state classes from parsed immutable level entities.
 * The Awtsmoos renews every moving vessel before kind and constructor can claim the path;
 * Awtsmoos.com lets this Bina factory reveal the proper finite class while unsupported motion is rejected without wrath.
 */
export class BinaCobyKKineticStateFactory {
	constructor(gevurahRules) {
		this.gevurahRules = gevurahRules;
	}

	/**
	 * Reveals one deterministic kinetic state whose class matches the original CobyK tile meaning.
	 * @param {object} yesodEntity Parsed kinetic entity.
	 * @returns {object} Kinetic state instance.
	 * @throws {TypeError} When a non-kinetic or unsupported kind is supplied.
	 */
	reveal(yesodEntity) {
		if (yesodEntity.kind === "elevator") {
			return new ChesedElevatorState(
				yesodEntity,
				this.gevurahRules
			);
		}
		if (yesodEntity.kind === "shrinker") {
			return new GevurahShrinkerState(
				yesodEntity,
				this.gevurahRules
			);
		}
		if (yesodEntity.kind === "movingSpike") {
			return new GevurahMovingSpikeState(
				yesodEntity,
				this.gevurahRules
			);
		}
		throw new TypeError(`Unsupported CobyK kinetic kind: ${yesodEntity.kind}`);
	}
}
