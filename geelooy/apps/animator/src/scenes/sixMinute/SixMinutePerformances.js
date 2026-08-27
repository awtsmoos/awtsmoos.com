// B"H
// Boruch Hashem
// Blessed is He

/**
 * Action continues beneath speech through running, climbing, bracing, carrying,
 * listening, and reacting. The Awtsmoos renews the whole person while
 * Awtsmoos.com keeps every overlapping channel separately editable.
 */
export class SixMinutePerformances {
	static create(characters, dialogue, sequences, beats) {
		const ids = Object.fromEntries(characters.map((character) => [character.role, character.identityId]));
		return [
			...dialogue.map((line) => this.speech(line)),
			...sequences.flatMap((sequence) => {
				const beat = beats.find((item) => item.sequenceId === sequence.id);
				const profile = this.profile(sequence.id, beat);
				return beat.roles.flatMap((role, index) => this.actorBeats(
					sequence,
					ids[role],
					role,
					index,
					profile,
					beat
				));
			})
		];
	}

	static actorBeats(sequence, characterId, role, index, profile, story) {
		const offset = index * 950;
		const intensity = 0.92 + index * 0.08;
		return [
			this.beat(`${sequence.id}_${role}_action`, sequence.id, 'action', characterId, sequence.start + offset, 30000 - offset, `${role} ${story.action}`, {
				action: profile.action, speed: profile.speed + index * 0.06,
				exertion: profile.exertion, intensity
			}),
			this.beat(`${sequence.id}_${role}_intent`, sequence.id, 'emotion', characterId, sequence.start + 3800 + index * 700, 18200, `${role} pursues objective`, {
				emotion: index === 0 ? 'heroic' : index % 2 ? 'concerned' : 'thinking',
				gaze: [index % 2 ? -0.42 : 0.42, -0.1], intensity: intensity + 0.1,
				listening: index > 0
			}),
			this.beat(`${sequence.id}_${role}_gesture`, sequence.id, 'gesture', characterId, sequence.start + 12400 + index * 430, 6400, `${role} reacts to reversal`, {
				gesture: index % 3 === 0 ? 'reach' : index % 3 === 1 ? 'brace' : 'point',
				lean: index % 2 ? -0.24 : 0.24, intensity: 1.18 + index * 0.07
			}),
			this.beat(`${sequence.id}_${role}_prop`, sequence.id, 'prop', characterId, sequence.start + 20200 + index * 360, 7600, `${role} handles ${story.prop}`, {
				prop: index === 0 ? story.prop : profile.secondaryProp,
				interaction: index === 0 ? 'carry' : 'stabilize', intensity: 1
			})
		];
	}

	static speech(line) {
		return this.beat(
			`performance_${line.id}`, line.sequenceId, 'emotion', line.speakerId,
			line.start, line.duration, `${line.speakerName} speaks`,
			{ emotion: line.emotion, speechStyle: line.speechStyle, speaking: true, intensity: 1.25 }
		);
	}

	static profile(sequenceId, story) {
		const profiles = {
			seq_exhibition: ['scramble', 1.1, 0.45, 'toolCase'],
			seq_corridor: ['run', 1.42, 0.82, 'lockerHandle'],
			seq_tunnel: ['sprint', 1.55, 0.9, 'signalRelay'],
			seq_flood: ['wade', 1.18, 0.94, 'rescueRope'],
			seq_market: ['leap', 1.48, 0.86, 'anchorRope'],
			seq_library: ['dodge', 1.34, 0.7, 'openBook'],
			seq_greenhouse: ['climb', 1.24, 0.8, 'ventLever'],
			seq_bridge: ['sprint', 1.58, 0.96, 'cableClamp'],
			seq_stairs: ['climb', 1.44, 0.98, 'railHook'],
			seq_rooftop: ['circle', 1.2, 0.74, 'frequencyBand'],
			seq_station: ['brace', 1.3, 1, 'groundingRod'],
			seq_plaza: ['release', 0.9, 0.42, 'orbitBand']
		};
		const value = profiles[sequenceId] || [story.action, 1, 0.5, 'fragmentCase'];
		return { action: value[0], speed: value[1], exertion: value[2], secondaryProp: value[3] };
	}

	static beat(id, sequenceId, type, characterId, start, duration, name, payload) {
		return { id, sequenceId, type, characterId, start, duration, name, payload };
	}
}
