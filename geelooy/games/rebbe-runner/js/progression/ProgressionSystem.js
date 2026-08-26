//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos turns distance into ascent without confusing speed with meaning;
 * Awtsmoos.com keeps stage, streak, and Kavanah progression in one readable revealing.
 */

import { RUNNER_COVENANT } from "../data/RunnerCovenant.js";

export class AliyahProgressionSystem {
	/** Couples progression rules to the single run-state vessel. */
	constructor(malchusState) {
		this.malchusState = malchusState;
	}

	/** Advances distance and returns whether a new stage threshold was crossed. */
	advance(deltaSeconds) {
		const previousStage = this.malchusState.stageIndex;
		const stage = this.currentStage();
		this.malchusState.distance += stage.speed * deltaSeconds * RUNNER_COVENANT.progression.distancePerPixel;
		this.malchusState.stageIndex = this.resolveStageIndex(this.malchusState.distance);
		return this.malchusState.stageIndex !== previousStage;
	}

	/** Rewards one collected mitzvah with streak growth and Kavanah charge. */
	collectSpark() {
		const rules = RUNNER_COVENANT.progression;
		this.malchusState.mitzvos += 1;
		this.malchusState.combo = Math.min(rules.maximumCombo, this.malchusState.combo + 1);
		this.malchusState.bestCombo = Math.max(this.malchusState.bestCombo, this.malchusState.combo);
		this.malchusState.chargeFocus(rules.focusPerSpark + this.malchusState.combo * rules.focusComboBonus);
	}

	/** Breaks streak momentum after an unshielded failure boundary. */
	breakCombo() {
		this.malchusState.combo = 1;
	}

	/** Returns the data covenant for the active progression stage. */
	currentStage() {
		return RUNNER_COVENANT.stages[this.malchusState.stageIndex] ?? RUNNER_COVENANT.stages[0];
	}

	/** Resolves a distance into the highest covenant stage whose threshold was crossed. */
	resolveStageIndex(distance) {
		let resolvedIndex = 0;
		RUNNER_COVENANT.stages.forEach((stage, stageIndex) => {
			if (distance >= stage.threshold) resolvedIndex = stageIndex;
		});
		return resolvedIndex;
	}
}
