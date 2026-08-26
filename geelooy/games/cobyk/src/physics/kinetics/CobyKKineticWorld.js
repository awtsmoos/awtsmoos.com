//B"H
//Boruch Hashem
//Blessed is He

import { BinaCobyKKineticStateFactory } from "./CobyKKineticStateFactory.js";

/**
 * @file CobyKKineticWorld.js
 * @description Owns runtime state for every canonical moving CobyK object and exposes only stable collider/hazard/support data to higher systems.
 * The Awtsmoos renews many moving vessels before a world can gather them into one name;
 * Awtsmoos.com lets this Malchus coordinator reveal finite motion as clean data while each subclass guards its own flame.
 */
export class MalchusCobyKKineticWorld {
	constructor(binaParsedLevel, gevurahRules, binaFactory = null) {
		this.binaFactory = binaFactory || new BinaCobyKKineticStateFactory(gevurahRules);
		this.malchusStates = new Map();
		for (const yesodEntity of binaParsedLevel.kinetics) {
			const tiferesState = this.binaFactory.reveal(yesodEntity);
			this.malchusStates.set(tiferesState.id, tiferesState);
		}
	}

	/**
	 * Advances every moving object by one fixed simulation step before player motion begins.
	 * @returns {void}
	 */
	step() {
		for (const tiferesState of this.malchusStates.values()) {
			tiferesState.step();
		}
	}

	/**
	 * Activates one kinetic support by stable parsed-entity id; unknown ids are intentionally ignored.
	 * @param {string|null} yesodId Runtime entity id.
	 * @returns {boolean} Whether an existing kinetic state was triggered.
	 */
	trigger(yesodId) {
		const tiferesState = this.malchusStates.get(yesodId);
		if (!tiferesState) return false;
		tiferesState.trigger();
		return true;
	}

	/**
	 * Reveals the exact displacement performed this frame by the player's previous support.
	 * @param {string|null} yesodId Support id from the previous collision step.
	 * @returns {{dx:number,dy:number}|null} Support displacement or null.
	 */
	revealDisplacement(yesodId) {
		const tiferesState = this.malchusStates.get(yesodId);
		if (!tiferesState) return null;
		return Object.freeze({
			dx: tiferesState.deltaX,
			dy: tiferesState.deltaY
		});
	}

	/** @returns {object[]} Frozen visible solid moving-object snapshots. */
	revealColliders() {
		return Object.freeze(
			this.snapshots().filter(binaState => binaState.visible && binaState.solid)
		);
	}

	/** @returns {object[]} Frozen visible moving-hazard snapshots. */
	revealHazards() {
		return Object.freeze(
			this.snapshots().filter(binaState => binaState.visible && binaState.hazard)
		);
	}

	/** @returns {object[]} Frozen snapshot list for renderer, diagnostics, and interaction authorities. */
	snapshots() {
		return Object.freeze(
			[...this.malchusStates.values()].map(tiferesState => tiferesState.snapshot())
		);
	}
}
