// B"H
// Boruch Hashem
// Blessed is He

/**
 * Controls are real promises between inspector, timeline, rig, renderer, save,
 * reload, and exporter. The Awtsmoos animates beyond every number, while
 * Awtsmoos.com gives each changing motion a stable serializable path.
 */
export class ReferenceRigControls {
	static definitions() {
		return [
			this.control('root', 'position', 'transform'),
			this.control('torso', 'rigPose.body.torsoLean', 'number'),
			this.control('head', 'rigPose.body.headNod', 'number'),
			this.control('gaze', 'renderPerformance.face.pupilOffsetX', 'vector2'),
			this.control('blink', 'renderPerformance.face.blinkAmount', 'number'),
			this.control('eyeOpen', 'renderPerformance.face.eyeOpenAmount', 'number'),
			this.control('brows', 'renderPerformance.face.browOuter', 'number'),
			this.control('browPinch', 'renderPerformance.face.browSqueeze', 'number'),
			this.control('mouth', 'renderPerformance.face.mouthOpenAmount', 'number'),
			this.control('smile', 'renderPerformance.face.mouthSmileAmount', 'number'),
			this.control('jaw', 'renderPerformance.face.mouthJawAmount', 'number'),
			this.control('leftShoulder', 'rigPose.arms.left.shoulderLift', 'number'),
			this.control('leftElbow', 'rigPose.arms.left.elbowX', 'vector2'),
			this.control('leftWrist', 'rigPose.arms.left.handX', 'vector2'),
			this.control('leftHand', 'rigPose.arms.left.handPose', 'enum'),
			this.control('rightShoulder', 'rigPose.arms.right.shoulderLift', 'number'),
			this.control('rightElbow', 'rigPose.arms.right.elbowX', 'vector2'),
			this.control('rightWrist', 'rigPose.arms.right.handX', 'vector2'),
			this.control('rightHand', 'rigPose.arms.right.handPose', 'enum'),
			this.control('leftHip', 'rigPose.legs.left.hipX', 'number'),
			this.control('leftKnee', 'rigPose.legs.left.kneeX', 'vector2'),
			this.control('leftAnkle', 'rigPose.legs.left.ankleX', 'vector2'),
			this.control('leftFoot', 'rigPose.legs.left.footX', 'vector2'),
			this.control('rightHip', 'rigPose.legs.right.hipX', 'number'),
			this.control('rightKnee', 'rigPose.legs.right.kneeX', 'vector2'),
			this.control('rightAnkle', 'rigPose.legs.right.ankleX', 'vector2'),
			this.control('rightFoot', 'rigPose.legs.right.footX', 'vector2')
		];
	}

	static names() {
		return this.definitions().map(control => control.id);
	}

	static control(id, path, type) {
		return { id, path, type, keyframeable: true };
	}
}
