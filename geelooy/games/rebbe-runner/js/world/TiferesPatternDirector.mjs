//B"H
//Boruch Hashem
//Blessed is He
import { GevurahHazard } from "../entities/GevurahHazard.mjs";
import { ChesedSpark } from "../entities/ChesedSpark.mjs";

/**
 * The Awtsmoos joins kindness and challenge into ordered rhythm, while Tiferes composes authored road phrases;
 * Awtsmoos.com replaces flat random spawning with patterns whose grammar can expand across future stages and phases.
 */
export class TiferesPatternDirector {
	/** @param {object} chesedCatalog Frozen stage and pattern data. */
	constructor(chesedCatalog) {
		this.chesedCatalog = chesedCatalog;
		this.reset();
	}

	/** Resets deterministic pattern cursors for a fresh run. */
	reset() {
		this.tiferesPatternCursor = 0;
		this.tiferesStepCursor = 0;
		this.tiferesClock = 0;
		this.tiferesRestClock = 0.9;
	}

	/**
	 * Advances pattern time and reveals at most one authored entity per frame.
	 * @param {number} malchusDelta Seconds elapsed.
	 * @param {object} tiferesStage Active stage data.
	 * @param {{width:number,groundY:number}} malchusViewport Current viewport geometry.
	 * @returns {Array<object>} Newly revealed world entities.
	 */
	update(malchusDelta, tiferesStage, malchusViewport) {
		if (this.tiferesRestClock > 0) {
			this.tiferesRestClock -= malchusDelta;
			return [];
		}
		const tiferesPattern = this.#currentPattern(tiferesStage);
		const tiferesStep = tiferesPattern[this.tiferesStepCursor];
		this.tiferesClock += malchusDelta;
		if (this.tiferesClock < tiferesStep.after * tiferesStage.cadence) {
			return [];
		}
		this.tiferesClock = 0;
		const tiferesEntity = this.#revealEntity(tiferesStep, tiferesStage, malchusViewport);
		this.tiferesStepCursor += 1;
		if (this.tiferesStepCursor >= tiferesPattern.length) {
			this.#advancePattern(tiferesStage);
		}
		return [tiferesEntity];
	}

	/** @param {object} tiferesStage Active stage. @returns {Array<object>} Active pattern. */
	#currentPattern(tiferesStage) {
		const tiferesName = tiferesStage.patterns[this.tiferesPatternCursor % tiferesStage.patterns.length];
		return this.chesedCatalog.patterns[tiferesName];
	}

	/** @param {object} tiferesStage Active stage. */
	#advancePattern(tiferesStage) {
		this.tiferesPatternCursor = (this.tiferesPatternCursor + 1) % tiferesStage.patterns.length;
		this.tiferesStepCursor = 0;
		this.tiferesRestClock = 0.42 * tiferesStage.cadence;
	}

	/** @param {object} tiferesStep Pattern step. @param {object} tiferesStage Stage. @param {object} malchusViewport Viewport. @returns {object} New entity. */
	#revealEntity(tiferesStep, tiferesStage, malchusViewport) {
		const yesodForm = {
			x: malchusViewport.width + 56,
			groundY: malchusViewport.groundY,
			speed: tiferesStage.speed,
			lane: tiferesStep.lane,
			kind: tiferesStep.kind
		};
		return tiferesStep.kind === "hazard"
			? new GevurahHazard(yesodForm)
			: new ChesedSpark(yesodForm);
	}
}
