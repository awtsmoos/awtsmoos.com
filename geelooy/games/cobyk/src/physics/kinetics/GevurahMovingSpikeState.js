//B"H
//Boruch Hashem
//Blessed is He

import { DomemCobyKKineticState } from "./DomemCobyKKineticState.js";

/**
 * @file GevurahMovingSpikeState.js
 * @description Preserves CobyK's moving-spike identity as a deterministic five-tile horizontal patrol with exact bounded reversal.
 * The Awtsmoos renews danger and direction before motion can claim an independent decree;
 * Awtsmoos.com lets this Gevurah vessel carry finite peril across a measured path while collision truth remains clean and free.
 */
export class GevurahMovingSpikeState extends DomemCobyKKineticState {
	constructor(yesodEntity, gevurahRules) {
		super(yesodEntity);
		this.gevurahRules = gevurahRules;
		this.netzachDirection = 1;
		this.hazard = true;
		this.solid = false;
	}

	/**
	 * Advances the hazard by one fixed step and reverses exactly at either end of the original five-tile patrol course.
	 * @returns {void}
	 */
	step() {
		this.beginStep();
		const gevurahDistance = this.gevurahRules.movingSpikeDistance;
		const tiferesMinimum = this.originX;
		const tiferesMaximum = this.originX + gevurahDistance;
		const netzachDelta = this.netzachDirection *
			this.gevurahRules.movingSpikeSpeed *
			this.gevurahRules.fixedStep;
		let malchusNextX = this.x + netzachDelta;
		if (malchusNextX >= tiferesMaximum) {
			malchusNextX = tiferesMaximum;
			this.netzachDirection = -1;
		} else if (malchusNextX <= tiferesMinimum) {
			malchusNextX = tiferesMinimum;
			this.netzachDirection = 1;
		}
		this.moveBy(malchusNextX - this.x, 0);
	}

	/** @returns {object} Frozen collider snapshot enriched with patrol direction and origin. */
	snapshot() {
		return Object.freeze({
			...super.snapshot(),
			originX: this.originX,
			direction: this.netzachDirection
		});
	}
}
