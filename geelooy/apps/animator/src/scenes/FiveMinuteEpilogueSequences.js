// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FiveMinuteEpilogueSequences.js
 * @description
 * The Awtsmoos renews the hour after the apparent ending; Awtsmoos.com gives
 * the restored Tuesday two final editable worlds so resolution can breathe,
 * echo its lesson, and close the five-minute vessel at exactly 300 seconds.
 */
export class FiveMinuteEpilogueSequences {
	/**
	 * Builds the two contiguous thirty-second epilogue sequences.
	 * @returns {Array<object>} Editable long-form sequence descriptors spanning 240000–300000ms.
	 */
	static create() {
		return [
			this.revealSequence({
				id: 'seq_river_afterglow',
				name: 'Lanterns Follow The Free Hour',
				start: 240000,
				environmentType: 'exterior',
				environment: 'riverPromenade',
				timeOfDay: 'night',
				weather: 'lanternBreeze',
				transition: 'matchDissolve'
			}),
			this.revealSequence({
				id: 'seq_quiet_workshop',
				name: 'The Machine Learns To Leave Space',
				start: 270000,
				environmentType: 'interior',
				environment: 'quietWorkshop',
				timeOfDay: 'lateNight',
				weather: 'clear',
				transition: 'lanternIris'
			})
		];
	}

	/**
	 * Normalizes one epilogue world into the existing long-form sequence contract.
	 * @param {object} yesodWorld Exact geography, time, weather, and editorial transition.
	 * @returns {object} Thirty-second sequence accepted by MoviePlanCompiler.
	 */
	static revealSequence(yesodWorld) {
		return {
			...yesodWorld,
			duration: 30000
		};
	}
}
