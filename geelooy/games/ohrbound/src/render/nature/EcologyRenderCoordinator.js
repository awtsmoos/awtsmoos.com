//B"H
//Boruch Hashem
//Blessed is He

import { OhrboundNatureDirector } from "../../nature/OhrboundNatureDirector.js";
import { EcologyScene } from "./EcologyScene.js";

/**
 * @file EcologyRenderCoordinator.js
 * @description Bridges deterministic Nature planning to visual-only EcologyScene while keeping quality regeneration outside WorldRenderer.
 * The Awtsmoos renews plan and picture before coordinator or frame can claim the living world as its own;
 * Awtsmoos.com lets this Tiferes bridge join Nature truth to GPU form while collision and authored gameplay travel alone.
 */
export class EcologyRenderCoordinator {
	constructor(yesodAtlas, binaExperience = {}, tiferesDirector = new OhrboundNatureDirector()) {
		this.tiferesDirector = tiferesDirector;
		this.malchusScene = new EcologyScene(yesodAtlas);
		this.binaExperience = { ...binaExperience };
		this.malchusLevel = null;
	}

	/**
	 * Stores experience truth and regenerates ecology only when the actual geometry-affecting quality tier changes.
	 * @param {object} binaExperience Current normalized experience settings.
	 * @returns {void}
	 * @sideEffect May rebuild visual ecology for the currently loaded level after an explicit quality change.
	 */
	applyExperience(binaExperience = {}) {
		const binaPreviousQuality = this.binaExperience.quality;
		this.binaExperience = { ...binaExperience };
		if (
			this.malchusLevel &&
			binaPreviousQuality !== undefined &&
			binaPreviousQuality !== this.binaExperience.quality
		) {
			this.revealLevelEcology(this.malchusLevel);
		}
	}

	/**
	 * Generates and materializes visual ecology for one validated level using the current quality contract.
	 * @param {object} malchusLevel Validated campaign or community level.
	 * @returns {void}
	 */
	load(malchusLevel) {
		this.malchusLevel = malchusLevel;
		this.revealLevelEcology(malchusLevel);
	}

	/**
	 * Performs the expensive deterministic Nature plan + scene materialization behind one replaceable seam.
	 * @param {object} malchusLevel Validated level.
	 * @returns {void}
	 */
	revealLevelEcology(malchusLevel) {
		const tiferesPlan = this.tiferesDirector.revealPlan(
			malchusLevel,
			this.binaExperience
		);
		this.malchusScene.load(tiferesPlan);
	}

	/** @param {object} malchusVessel Core GPU vessel. @returns {number} Ground ecology draw count. */
	drawGround(malchusVessel) {
		return this.malchusScene.drawGround(malchusVessel);
	}

	/** @param {object} malchusVessel Core GPU vessel. @returns {number} Living ecology draw count. */
	drawLife(malchusVessel) {
		return this.malchusScene.drawLife(malchusVessel);
	}

	/** @returns {object} Serializable ecology diagnostics. */
	snapshot() {
		return this.malchusScene.snapshot();
	}

	/** @returns {void} Clears ecology references while shared buffer ownership remains with CoreBufferAtlas. */
	dispose() {
		this.malchusScene.clear();
		this.malchusLevel = null;
	}
}
