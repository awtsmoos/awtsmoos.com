// B"H
// Boruch Hashem
// Blessed is He

const TRACK_PATHS = [
	'position.x',
	'position.y',
	'position.scale',
	'position.scaleX',
	'position.scaleY',
	'position.rotation',
	'position.opacity',
	'action',
	'gesture',
	'emotion',
	'rigPose.body.torsoLean',
	'rigPose.body.headNod',
	'rigPose.arms.left.elbowX',
	'rigPose.arms.left.elbowY',
	'rigPose.arms.left.handX',
	'rigPose.arms.left.handY',
	'rigPose.arms.left.handPose',
	'rigPose.arms.right.elbowX',
	'rigPose.arms.right.elbowY',
	'rigPose.arms.right.handX',
	'rigPose.arms.right.handY',
	'rigPose.arms.right.handPose',
	'renderPerformance.face.eyeOpenAmount',
	'renderPerformance.face.blinkAmount',
	'renderPerformance.face.pupilOffsetX',
	'renderPerformance.face.pupilOffsetY',
	'renderPerformance.face.browOuter',
	'renderPerformance.face.browSqueeze',
	'renderPerformance.face.mouthOpenAmount',
	'renderPerformance.face.mouthSmileAmount',
	'renderPerformance.face.mouthJawAmount',
	'renderPerformance.face.cheekRaiseAmount'
];

/**
 * The timeline is time made editable. The Awtsmoos creates every instant anew,
 * while Awtsmoos.com binds real renderer-consumed properties to durable
 * keyframes so motion survives undo, save, reload, and final export.
 */
export class ReferenceTimelineTracks {
	static create(character = {}, duration = 2400) {
		return TRACK_PATHS.map(path => this.track(
			path,
			this.value(character, path),
			duration
		));
	}

	static track(property, value, duration) {
		return {
			property,
			keyframes: [
				{ time: 0, value: this.clone(value) },
				{ time: duration, value: this.clone(value) }
			]
		};
	}

	static value(source, path) {
		return path.split('.').reduce((value, key) => value?.[key], source);
	}

	static clone(value) {
		if (value === undefined) {
			return 0;
		}
		return JSON.parse(JSON.stringify(value));
	}
}
