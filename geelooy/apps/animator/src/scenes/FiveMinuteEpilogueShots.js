// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FiveMinuteEpilogueShots.js
 * @description
 * The Awtsmoos renews viewpoint before meaning can settle; Awtsmoos.com closes
 * the movie through eight deliberate views that move from communal lantern light
 * into a quiet machine-room detail without losing screen direction or bubble safety.
 */
export class FiveMinuteEpilogueShots {
	/**
	 * Builds eight 7.5-second epilogue shots from the existing editable cast.
	 * @param {Array<object>} keterCast Existing long-form character descriptors.
	 * @param {Array<object>} malchusSequences The two epilogue sequences.
	 * @returns {Array<object>} Camera clips accepted by LongFormCinematicMovieSchema.
	 */
	static create(keterCast, malchusSequences) {
		const yesodIdentity = this.identityResolver(keterCast);
		const tiferesCast = [
			yesodIdentity('talia'),
			yesodIdentity('barak'),
			yesodIdentity('sela'),
			yesodIdentity('ori'),
			yesodIdentity('gideon')
		];
		return malchusSequences.flatMap((malchusSequence, gevurahSequenceIndex) => {
			return this.revealSequenceShots(
				malchusSequence,
				gevurahSequenceIndex,
				tiferesCast
			);
		});
	}

	/**
	 * Creates one four-shot continuity block for a thirty-second sequence.
	 * @param {object} malchusSequence Sequence receiving the shots.
	 * @param {number} gevurahSequenceIndex Epilogue sequence index used for camera variety.
	 * @param {Array<string>} tiferesCast Character identity ids visible in the scene.
	 * @returns {Array<object>} Four contiguous camera shot descriptors.
	 */
	static revealSequenceShots(malchusSequence, gevurahSequenceIndex, tiferesCast) {
		const chesedGrammar = this.cameraGrammar()[gevurahSequenceIndex];
		return chesedGrammar.map((tiferesCamera, yesodShotIndex) => ({
			id: `shot_epilogue_${gevurahSequenceIndex + 1}_${yesodShotIndex + 1}`,
			sequenceId: malchusSequence.id,
			start: malchusSequence.start + yesodShotIndex * 7500,
			duration: 7500,
			camera: { ...tiferesCamera },
			characters: yesodShotIndex === 3 ? tiferesCast.slice(0, 2) : [...tiferesCast],
			transition: yesodShotIndex === 0 ? malchusSequence.transition : 'cut',
			composition: {
				depthLayers: 5,
				thirdsBias: yesodShotIndex % 2 ? 'right' : 'left',
				motivatedFocus: true
			},
			continuity: {
				screenDirection: gevurahSequenceIndex ? 'rightToLeft' : 'leftToRight',
				eyeLineAxis: `${malchusSequence.id}_axis`,
				bubbleSafe: true
			}
		}));
	}

	/**
	 * Resolves stable character identity ids by semantic role.
	 * @param {Array<object>} keterCast Existing editable cast.
	 * @returns {Function} Resolver from role name to identity id.
	 */
	static identityResolver(keterCast) {
		return (yesodRole) => {
			const malchusActor = keterCast.find((tiferesActor) => tiferesActor.role === yesodRole);
			if (!malchusActor) {
				throw new Error(`Epilogue cast is missing role: ${yesodRole}`);
			}
			return malchusActor.identityId;
		};
	}

	/**
	 * Returns two four-shot camera grammars with distinct sizes, angles, and movement.
	 * @returns {Array<Array<object>>} Camera metadata consumed directly by the renderer.
	 */
	static cameraGrammar() {
		return [
			[
				{ size: 'wide', angle: 'birdEye', move: 'craneDown', purpose: 'reveal free-hour lantern flow' },
				{ size: 'tracking', angle: 'side', move: 'truckRight', purpose: 'follow ensemble promenade' },
				{ size: 'closeUp', angle: 'profile', move: 'slowPush', purpose: 'hold reflective dialogue' },
				{ size: 'insert', angle: 'topDown', move: 'tiltDown', purpose: 'reveal unscheduled calendar card' }
			],
			[
				{ size: 'wide', angle: 'lowAngle', move: 'dollyIn', purpose: 'return to quiet workshop' },
				{ size: 'twoShot', angle: 'overShoulder', move: 'arcLeft', purpose: 'share final machine adjustment' },
				{ size: 'closeUp', angle: 'threeQuarter', move: 'slowPush', purpose: 'land final human reaction' },
				{ size: 'insert', angle: 'macro', move: 'pullBack', purpose: 'end on the free-hour indicator' }
			]
		];
	}
}
