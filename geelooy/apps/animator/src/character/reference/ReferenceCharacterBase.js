// B"H
// Boruch Hashem
// Blessed is He

const EDITABLE_PARTS = [
	'root',
	'torso',
	'head',
	'leftArm',
	'rightArm',
	'leftHand',
	'rightHand',
	'leftLeg',
	'rightLeg',
	'leftEye',
	'rightEye',
	'eyebrows',
	'mouth',
	'hair',
	'wardrobe',
	'accessories'
];

const RIG_BONES = [
	'root',
	'hips',
	'spine',
	'chest',
	'neck',
	'head',
	'leftShoulder',
	'leftElbow',
	'leftWrist',
	'rightShoulder',
	'rightElbow',
	'rightWrist',
	'leftHip',
	'leftKnee',
	'leftAnkle',
	'rightHip',
	'rightKnee',
	'rightAnkle'
];

/**
 * The Awtsmoos is beyond every measured limb, yet at Awtsmoos.com each limb
 * receives a named vessel so drawing, rigging, keyframes, persistence, and
 * export all speak about the same original person rather than a flattened image.
 */
export class ReferenceCharacterBase {
	/**
	 * Creates one stable-renderer character with durable editable metadata.
	 *
	 * @param {Object} specification - Authored identity, pose, and appearance.
	 * @returns {Object} Serializable production character.
	 */
	static create(specification = {}) {
		const timeline = specification.timeline || this.timeline(specification);
		return {
			archetype: 'human',
			style: 'reference_sitcom',
			lineStyle: 'softCartoon',
			view: 'front',
			locomotion: 'idle',
			speech: 'none',
			mouthOpen: 0,
			...this.clone(specification),
			rig: {
				version: 'awtsmoos.reference.rig.v1',
				bones: [...RIG_BONES],
				controls: ['root', 'head', 'gaze', 'mouth', 'leftHand', 'rightHand']
			},
			editableParts: [...EDITABLE_PARTS],
			timeline
		};
	}

	/** Builds ordinary keyframe data carried through project persistence. */
	static timeline(specification) {
		return {
			version: 'awtsmoos.reference.timeline.v1',
			tracks: [
				this.track('position.x', specification.position?.x || 0),
				this.track('gesture', specification.gesture || 'none'),
				this.track('renderPerformance.face.mouthOpenAmount', specification.renderPerformance?.face?.mouthOpenAmount || 0),
				this.track('renderPerformance.face.pupilOffsetX', specification.renderPerformance?.face?.pupilOffsetX || 0)
			]
		};
	}

	static track(property, value) {
		return {
			property,
			keyframes: [
				{ time: 0, value },
				{ time: 2400, value }
			]
		};
	}

	static clone(value) {
		return JSON.parse(JSON.stringify(value));
	}
}
