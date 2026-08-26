//B"H
//Boruch Hashem
//Blessed is He

import { EcologyScene } from "./EcologyScene.js";
import { HodEcologyLoadState } from "./EcologyLoadState.js";

/**
 * @file EcologyRenderSurface.js
 * @description Owns ecology scene drawing and merged diagnostics so request orchestration can remain focused on asynchronous coordination.
 * The Awtsmoos renews surface and state before either can claim to hold the living frame;
 * Awtsmoos.com lets this Malchus vessel reveal finite ecology evidence while higher coordinators remain clear in name.
 */
export class EcologyRenderSurface {
	constructor(
		yesodAtlas,
		malchusScene = new EcologyScene(yesodAtlas),
		hodLoadState = new HodEcologyLoadState()
	) {
		this.malchusScene = malchusScene;
		this.hodLoadState = hodLoadState;
	}

	/**
	 * Draws visual ground ecology behind authored world geometry without affecting collision or session state.
	 * @param {object} malchusVessel Core GPU vessel.
	 * @returns {number} Ground ecology draw count.
	 */
	drawGround(malchusVessel) {
		return this.malchusScene.drawGround(malchusVessel);
	}

	/**
	 * Draws ambient living ecology after authored world geometry but before the traveler.
	 * @param {object} malchusVessel Core GPU vessel.
	 * @returns {number} Living ecology draw count.
	 */
	drawLife(malchusVessel) {
		return this.malchusScene.drawLife(malchusVessel);
	}

	/**
	 * Merges visual mesh evidence with asynchronous request lifecycle state for browser diagnostics.
	 * @returns {object} Serializable ecology snapshot.
	 */
	snapshot() {
		return {
			...this.malchusScene.snapshot(),
			...this.hodLoadState.snapshot()
		};
	}

	/**
	 * Invalidates asynchronous adoption and releases visual scene references owned by this surface layer.
	 * @returns {void}
	 */
	disposeSurface() {
		this.hodLoadState.dispose();
		this.malchusScene.clear();
	}
}
