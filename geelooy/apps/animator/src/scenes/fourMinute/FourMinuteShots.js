// B"H
// Boruch Hashem
// Blessed is He

/**
 * Thirty-two purposeful shots move through front, profile, rear, high, low,
 * dutch, top-down, bird's-eye, over-shoulder, tracking, crane, dolly, and
 * handheld grammar. The Awtsmoos renews each viewpoint while Awtsmoos.com
 * preserves continuity and visible speakers.
 */
export class FourMinuteShots {
	static create(characters, sequences) {
		const id = role => characters.find(character => character.role === role).identityId;
		const cast = this.cast(id);
		const patterns = this.patterns();
		const purposes = [
			'establish geography',
			'emphasize speaker',
			'preserve eyeline',
			'reveal active object'
		];

		return sequences.flatMap((sequence, sequenceIndex) => (
			[0, 1, 2, 3].map(shotIndex => {
				const camera = patterns[(sequenceIndex * 4 + shotIndex) % patterns.length];
				const sceneCast = cast[sequence.environment];
				return {
					id: `shot_${sequenceIndex + 1}_${shotIndex + 1}`,
					sequenceId: sequence.id,
					start: sequence.start + shotIndex * 7500,
					duration: 7500,
					camera: {
						size: camera[0],
						angle: camera[1],
						move: camera[2],
						purpose: purposes[shotIndex]
					},
					characters: shotIndex < 3
						? [...sceneCast]
						: sceneCast.slice(-2),
					transition: shotIndex === 0 ? sequence.transition : 'cut',
					composition: {
						depthLayers: 4,
						thirdsBias: shotIndex % 2 ? 'right' : 'left',
						motivatedFocus: true
					},
					continuity: {
						screenDirection: sequenceIndex % 2 ? 'rightToLeft' : 'leftToRight',
						eyeLineAxis: `${sequence.id}_axis`,
						bubbleSafe: true
					}
				};
			})
		));
	}

	static cast(id) {
		return {
			workshop: [id('talia'), id('barak'), id('sela'), id('ori')],
			hallway: [id('talia'), id('barak'), id('sela'), id('gideon')],
			cityStreet: [id('talia'), id('barak'), id('sela'), id('gideon')],
			cityPark: [id('talia'), id('sela'), id('ori'), id('gideon')],
			rooftop: [id('talia'), id('barak'), id('sela'), id('ori'), id('gideon')],
			transitPlatform: [id('barak'), id('sela'), id('ori'), id('gideon')],
			repairLab: [id('talia'), id('barak'), id('sela'), id('ori')],
			festivalPlaza: [id('talia'), id('barak'), id('sela'), id('ori'), id('gideon')]
		};
	}

	static patterns() {
		return [
			['wide', 'eyeLevel', 'slowPush'],
			['closeUp', 'profile', 'dollyIn'],
			['overShoulder', 'threeQuarter', 'handheld'],
			['insert', 'topDown', 'tiltDown'],
			['tracking', 'side', 'truckRight'],
			['reaction', 'dutch', 'snapZoom'],
			['wide', 'lowAngle', 'craneUp'],
			['closeUp', 'highAngle', 'slowPush'],
			['twoShot', 'rearThreeQuarter', 'arcLeft'],
			['group', 'birdEye', 'pullBack']
		];
	}
}
