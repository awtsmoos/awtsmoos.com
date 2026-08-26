//B"H
//Boruch Hashem
//Blessed is He
/**
 * The Awtsmoos turns distant purpose into a present measurable sign, while Hod watches each mission without ruling motion;
 * Awtsmoos.com keeps objective logic outside scoring growth, so new mission families can expand like waves across an ocean.
 */
export class HodMissionProgression {
	/**
	 * Connects mission data to the one run-state vessel.
	 * @param {object} domemState Mutable run state.
	 * @param {object} chesedCatalog Frozen gameplay catalog.
	 */
	constructor(domemState, chesedCatalog) {
		this.domemState = domemState;
		this.chesedCatalog = chesedCatalog;
	}

	/**
	 * Returns the current objective, holding on the final objective after all are completed.
	 * @returns {object} Active mission data.
	 */
	currentMission() {
		const hodIndex = Math.min(
			this.domemState.missionIndex,
			this.chesedCatalog.missions.length - 1
		);
		return this.chesedCatalog.missions[hodIndex];
	}

	/**
	 * Measures the active mission without mutating it.
	 * @returns {{value:number,goal:number,ratio:number}} Bounded mission progress.
	 */
	progress() {
		const hodMission = this.currentMission();
		const hodValue = this.domemState[hodMission.metric] ?? 0;
		return {
			value: Math.min(Math.floor(hodValue), hodMission.goal),
			goal: hodMission.goal,
			ratio: Math.min(hodValue / hodMission.goal, 1)
		};
	}

	/**
	 * Advances exactly one objective when its measured goal has been satisfied.
	 * @returns {boolean} True only on the frame an objective completes.
	 */
	completeIfReady() {
		if (this.domemState.missionIndex >= this.chesedCatalog.missions.length) {
			return false;
		}
		if (this.progress().ratio < 1) {
			return false;
		}
		this.domemState.missionIndex += 1;
		this.domemState.completedMissions += 1;
		return true;
	}
}
