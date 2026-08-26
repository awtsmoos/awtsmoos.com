//B"H
//Boruch Hashem
//Blessed is He
import { HodMissionProgression } from "./HodMissionProgression.mjs";
import { TiferesStageOracle } from "./TiferesStageOracle.mjs";

/**
 * The Awtsmoos makes one moment grow into the next, and Tzomayach turns clean play into visible ascent;
 * Awtsmoos.com lets distance, sparks, stages, and flow deepen the run while Hod guards objective intent.
 */
export class TzomayachProgression {
	/**
	 * Joins growth rules to explicit state, stage lookup, and mission measurement.
	 * @param {object} domemState Mutable run-state vessel.
	 * @param {object} chesedCatalog Frozen gameplay catalog.
	 */
	constructor(domemState, chesedCatalog) {
		this.domemState = domemState;
		this.hodMissions = new HodMissionProgression(domemState, chesedCatalog);
		this.tiferesStages = new TiferesStageOracle(chesedCatalog);
	}

	/**
	 * Advances time, distance, score, stage, and mission completion from one measured frame.
	 * @param {number} malchusDelta Seconds elapsed in the bounded frame.
	 * @param {number} gevurahSpeed Current world speed in CSS pixels per second.
	 * @returns {boolean} Whether a mission completed during this advance.
	 */
	advance(malchusDelta, gevurahSpeed) {
		const domemState = this.domemState;
		domemState.elapsed += malchusDelta;
		domemState.distance += gevurahSpeed * malchusDelta * 0.1;
		domemState.stageIndex = this.tiferesStages.indexFor(domemState.distance);
		domemState.score = (
			domemState.distance +
			(domemState.sparks * 55) +
			(domemState.bestCombo * 18)
		);
		return this.hodMissions.completeIfReady();
	}

	/**
	 * Records a spark or shield and strengthens flow without coupling to rendering.
	 * @param {"spark"|"shield"} chesedKind Collected revelation kind.
	 * @returns {boolean} Whether the collection completed the active mission.
	 */
	collect(chesedKind) {
		if (chesedKind === "shield") {
			this.domemState.shield = 1;
		} else {
			this.domemState.sparks += 1;
		}
		this.#strengthenFlow();
		return this.hodMissions.completeIfReady();
	}

	/** Strengthens flow when a hazard is cleanly passed. */
	avoid() {
		this.#strengthenFlow();
	}

	/** Breaks current flow after a mistake while preserving the best achieved chain. */
	breakFlow() {
		this.domemState.combo = 0;
	}

	/**
	 * Consumes a protective spark if present.
	 * @returns {boolean} Whether protection absorbed the collision.
	 */
	useShield() {
		if (this.domemState.shield < 1) {
			return false;
		}
		this.domemState.shield = 0;
		this.breakFlow();
		return true;
	}

	/** @returns {object} Current stage data. */
	currentStage() {
		return this.tiferesStages.stageAt(this.domemState.stageIndex);
	}

	/** @returns {object} Current mission data. */
	currentMission() {
		return this.hodMissions.currentMission();
	}

	/** @returns {{value:number,goal:number,ratio:number}} Current mission witness. */
	missionProgress() {
		return this.hodMissions.progress();
	}

	/** Increases the active chain and records its historic peak. */
	#strengthenFlow() {
		this.domemState.combo += 1;
		this.domemState.bestCombo = Math.max(this.domemState.bestCombo, this.domemState.combo);
	}
}
