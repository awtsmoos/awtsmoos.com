// B"H
// Boruch Hashem
// Blessed is He

/**
 * Sixty variable shots follow physical objectives rather than a repeating grid.
 * The Awtsmoos renews every viewpoint while Awtsmoos.com preserves lens,
 * movement, blocking, focus, depth, and continuity as editable shot data.
 */
export class SixMinuteShots {
	static create(characters, sequences, beats) {
		const ids = Object.fromEntries(characters.map((character) => [character.role, character.identityId]));
		const durations = [4200, 5600, 6800, 5200, 8200];
		const patterns = this.patterns();
		return sequences.flatMap((sequence, sequenceIndex) => {
			const beat = beats.find((item) => item.sequenceId === sequence.id);
			const cast = beat.roles.map((role) => ids[role]);
			let localStart = 0;
			return durations.map((duration, shotIndex) => {
				const pattern = patterns[(sequenceIndex * 5 + shotIndex) % patterns.length];
				const start = sequence.start + localStart;
				localStart += duration;
				return this.shot(sequence, beat, cast, pattern, start, duration, sequenceIndex, shotIndex);
			});
		});
	}

	static shot(sequence, beat, cast, pattern, start, duration, sequenceIndex, shotIndex) {
		const focused = cast[shotIndex % cast.length];
		return {
			id: `beacon_shot_${sequenceIndex + 1}_${shotIndex + 1}`,
			sequenceId: sequence.id,
			start,
			duration,
			camera: {
				size: pattern.size,
				angle: pattern.angle,
				move: pattern.move,
				lens: pattern.lens,
				focus: pattern.focus,
				parallax: pattern.parallax,
				shake: ['storm', 'overload'].includes(sequence.weather) ? pattern.shake + 1.4 : pattern.shake,
				purpose: this.purpose(shotIndex, beat)
			},
			characters: shotIndex === 1 ? cast.slice(0, Math.min(2, cast.length)) : [...cast],
			focusCharacterId: focused,
			blocking: this.blocking(cast, shotIndex, sequenceIndex),
			transition: shotIndex === 0 ? sequence.transition : shotIndex === 3 ? 'impactCut' : 'cut',
			composition: {
				depthLayers: 6,
				thirdsBias: shotIndex % 2 ? 'right' : 'left',
				motivatedFocus: true,
				action: beat.action,
				prop: beat.prop
			},
			continuity: {
				screenDirection: sequenceIndex % 2 ? 'rightToLeft' : 'leftToRight',
				eyeLineAxis: `${sequence.id}_axis`,
				bubbleSafe: true,
				objective: beat.objective,
				reversal: beat.reversal
			}
		};
	}

	static blocking(cast, shotIndex, sequenceIndex) {
		const direction = sequenceIndex % 2 ? -1 : 1;
		return Object.fromEntries(cast.map((id, index) => {
			const depth = 0.34 + (index % 4) * 0.16;
			const startX = 90 + index * (470 / Math.max(1, cast.length - 1));
			const travel = direction * (shotIndex === 2 ? 120 : shotIndex === 4 ? 44 : 22);
			return [id, {
				start: { x: startX - travel, y: 316 - depth * 18, depth },
				end: { x: startX + travel, y: 316 - depth * 24 - (shotIndex === 3 ? 22 : 0), depth: Math.min(0.94, depth + shotIndex * 0.025) },
				focus: index === shotIndex % cast.length ? 1 : 0.4,
				enterAt: index > 2 && shotIndex === 0 ? 0.18 : 0,
				exitAt: index === 0 && shotIndex === 4 ? 0.86 : 1
			}];
		}));
	}

	static purpose(index, beat) {
		return [
			`establish ${beat.objective}`,
			'reveal emotional decision',
			`accelerate ${beat.action}`,
			`deliver reversal: ${beat.reversal}`,
			'resolve consequence and launch next pursuit'
		][index];
	}

	static patterns() {
		return [
			this.pattern('wide', 'eyeLevel', 'slowPush', 'wide', 0.35, 0.72, 0.2),
			this.pattern('closeUp', 'threeQuarter', 'rackFocus', 'portrait', 0.9, 0.22, 0.1),
			this.pattern('tracking', 'lowAngle', 'pursuit', 'wide', 0.7, 0.88, 3),
			this.pattern('reaction', 'dutch', 'crashZoom', 'portrait', 0.92, 0.34, 2),
			this.pattern('wide', 'highAngle', 'craneUp', 'wide', 0.46, 0.8, 0.6),
			this.pattern('extremeWide', 'aerialOblique', 'droneDive', 'ultraWide', 0.4, 1, 0.4),
			this.pattern('overShoulder', 'profile', 'shoulderRun', 'normal', 0.7, 0.6, 4),
			this.pattern('twoShot', 'rearThreeQuarter', 'orbitRight', 'normal', 0.65, 0.9, 0.7),
			this.pattern('extremeCloseUp', 'eyeLevel', 'locked', 'telephoto', 1, 0.12, 0.1),
			this.pattern('insert', 'topDown', 'whipPan', 'normal', 0.85, 0.62, 1.8),
			this.pattern('group', 'birdEye', 'pullBack', 'wide', 0.34, 0.94, 0.3),
			this.pattern('tracking', 'side', 'truckRight', 'wide', 0.55, 0.86, 0.8),
			this.pattern('closeUp', 'highAngle', 'dollyIn', 'portrait', 0.95, 0.28, 0.15),
			this.pattern('wide', 'wormEye', 'craneDive', 'ultraWide', 0.54, 0.96, 1.2),
			this.pattern('reaction', 'threeQuarter', 'snapZoom', 'telephoto', 0.98, 0.2, 0.8)
		];
	}

	static pattern(size, angle, move, lens, focus, parallax, shake) {
		return { size, angle, move, lens, focus, parallax, shake };
	}
}
