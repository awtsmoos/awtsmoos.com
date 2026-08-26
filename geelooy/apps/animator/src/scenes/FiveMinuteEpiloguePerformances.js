// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FiveMinuteEpiloguePerformances.js
 * @description
 * The Awtsmoos renews gesture, breath, pose, and object contact after dialogue;
 * Awtsmoos.com keeps the final minute visibly animated by editable performance
 * clips rather than letting the epilogue collapse into talking heads or a hold.
 */
export class FiveMinuteEpiloguePerformances {
	/**
	 * Builds emotional speech clips plus locomotion, prop, gesture, and pose beats.
	 * @param {Array<object>} keterCast Existing editable characters.
	 * @param {Array<object>} malchusDialogue Final-minute dialogue descriptors.
	 * @returns {Array<object>} Performance clips accepted by MoviePlanCompiler.
	 */
	static create(keterCast, malchusDialogue) {
		const yesodIdentity = this.identityResolver(keterCast);
		return [
			...malchusDialogue.map((tiferesLine) => this.emotionFromLine(tiferesLine)),
			this.revealBeat({
				id: 'epilogue_lantern_walk', type: 'action', characterId: yesodIdentity('talia'),
				start: 240000, duration: 30000, name: 'Walk the lantern promenade',
				payload: { action: 'walk', speed: 0.82, mood: 'relieved' }
			}),
			this.revealBeat({
				id: 'epilogue_lantern_hold', type: 'prop', characterId: yesodIdentity('ori'),
				start: 246000, duration: 15000, name: 'Steady a drifting lantern',
				payload: { prop: 'lantern', interaction: 'hold' }
			}),
			this.revealBeat({
				id: 'epilogue_free_card', type: 'prop', characterId: yesodIdentity('sela'),
				start: 258000, duration: 10000, name: 'Raise the blank calendar square',
				payload: { prop: 'freeTimeCard', interaction: 'raise' }
			}),
			this.revealBeat({
				id: 'epilogue_machine_repair', type: 'action', characterId: yesodIdentity('barak'),
				start: 270000, duration: 18000, name: 'Tune the quiet forecast machine',
				payload: { action: 'repair', speed: 0.52 }
			}),
			this.revealBeat({
				id: 'epilogue_empty_point', type: 'gesture', characterId: yesodIdentity('sela'),
				start: 279300, duration: 7000, name: 'Point to the intentionally empty square',
				payload: { gesture: 'point', intensity: 0.7 }
			}),
			this.revealBeat({
				id: 'epilogue_final_breath', type: 'pose', characterId: yesodIdentity('talia'),
				start: 289000, duration: 11000, name: 'Settle into the final quiet frame',
				payload: { pose: 'standing', breathing: 'calm', listening: true }
			})
		];
	}

	/**
	 * Converts a timed line into a simultaneous speaking emotion clip.
	 * @param {object} tiferesLine Dialogue source retaining speaker and emotion.
	 * @returns {object} Editable performance clip tied to the same sequence.
	 */
	static emotionFromLine(tiferesLine) {
		return this.revealBeat({
			id: `emotion_${tiferesLine.id}`,
			type: 'emotion',
			characterId: tiferesLine.speakerId,
			start: tiferesLine.start,
			duration: tiferesLine.duration,
			name: `${tiferesLine.speakerName} ${tiferesLine.emotion}`,
			payload: {
				emotion: tiferesLine.emotion,
				speechStyle: tiferesLine.speechStyle,
				speaking: true
			},
			sequenceId: tiferesLine.sequenceId
		});
	}

	/**
	 * Normalizes one visual performance descriptor into the current clip contract.
	 * @param {object} malchusBeat Complete performance metadata.
	 * @returns {object} Editable performance clip with a resolved sequence id.
	 */
	static revealBeat(malchusBeat) {
		return {
			...malchusBeat,
			sequenceId: malchusBeat.sequenceId || this.sequenceForTime(malchusBeat.start)
		};
	}

	/**
	 * Resolves the epilogue sequence that owns an absolute millisecond time.
	 * @param {number} malchusStart Absolute production time.
	 * @returns {string} Sequence id used by the NLE compiler.
	 */
	static sequenceForTime(malchusStart) {
		return malchusStart < 270000 ? 'seq_river_afterglow' : 'seq_quiet_workshop';
	}

	/**
	 * Builds a semantic role resolver and rejects missing cast members early.
	 * @param {Array<object>} keterCast Existing cast.
	 * @returns {Function} Role-to-identity resolver.
	 */
	static identityResolver(keterCast) {
		return (yesodRole) => {
			const tiferesActor = keterCast.find((malchusActor) => malchusActor.role === yesodRole);
			if (!tiferesActor) {
				throw new Error(`Epilogue performance is missing role: ${yesodRole}`);
			}
			return tiferesActor.identityId;
		};
	}
}
