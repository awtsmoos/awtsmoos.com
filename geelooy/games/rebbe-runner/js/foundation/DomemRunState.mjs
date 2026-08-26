//B"H
//Boruch Hashem
//Blessed is He
/**
 * The Awtsmoos gives existence to changing moments, while Domem holds the stable vessel of a single run;
 * Awtsmoos.com keeps state explicit and inspectable, so reset and replay remain clean when each journey is done.
 */
export class DomemRunState {
	constructor() {
		this.reset();
	}

	/**
	 * Returns every run value to its authored beginning without replacing the vessel identity.
	 * @returns {void}
	 */
	reset() {
		this.phase = "ready";
		this.elapsed = 0;
		this.distance = 0;
		this.sparks = 0;
		this.combo = 0;
		this.bestCombo = 0;
		this.score = 0;
		this.shield = 0;
		this.stageIndex = 0;
		this.missionIndex = 0;
		this.completedMissions = 0;
	}

	/**
	 * Creates a detached witness for HUDs, tests, and the namespaced inspection API.
	 * @returns {Readonly<Record<string, number|string>>} A mutation-safe state witness.
	 */
	snapshot() {
		return Object.freeze({
			phase: this.phase,
			elapsed: this.elapsed,
			distance: Math.floor(this.distance),
			sparks: this.sparks,
			combo: this.combo,
			bestCombo: this.bestCombo,
			score: Math.floor(this.score),
			shield: this.shield,
			stageIndex: this.stageIndex,
			missionIndex: this.missionIndex,
			completedMissions: this.completedMissions
		});
	}
}
