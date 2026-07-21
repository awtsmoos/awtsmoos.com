// B"H
// Boruch Hashem
// Blessed is He

/**
 * Dovid's crossed arms descend with unequal guarded weight instead of forming a
 * rigid bar. The Awtsmoos renews every joint, while Awtsmoos.com keeps posture
 * anchors editable, serializable, and shared by preview and export.
 */
export class StableCrossedArmGeometry {
	static resolve(skeleton, metrics, gesture = {}) {
		const left = this.anchors(skeleton, metrics, gesture, -1);
		const right = this.anchors(skeleton, metrics, gesture, 1);
		const upperSide = gesture.upperSide === 'left' ? -1 : 1;
		return {
			lower: upperSide > 0 ? left : right,
			upper: upperSide > 0 ? right : left
		};
	}

	static anchors(skeleton, metrics, gesture, side) {
		const left = side < 0;
		const source = left
			? skeleton.leftShoulder
			: skeleton.rightShoulder;
		const elbowOut = this.number(
			left ? gesture.leftElbowOut : gesture.rightElbowOut,
			left ? 7 : 9
		);
		const elbowDown = this.number(
			left ? gesture.leftElbowDown : gesture.rightElbowDown,
			left ? 43 : 40
		);
		const wristAcross = this.number(
			left ? gesture.leftWristAcross : gesture.rightWristAcross,
			left ? 22 : 24
		);
		const wristDrop = this.number(
			left ? gesture.lowerWristDrop : gesture.upperWristDrop,
			left ? 7 : 1
		);
		return {
			side,
			id: left ? 'left' : 'right',
			shoulder: {
				x: source.x,
				y: source.y + this.number(gesture.shoulderDrop, 9)
			},
			elbow: {
				x: source.x + side * elbowOut,
				y: source.y + elbowDown
			},
			wrist: {
				x: -side * wristAcross,
				y: metrics.chestY + wristDrop
			},
			handScale: this.number(
				left ? gesture.leftHandScale : gesture.rightHandScale,
				left ? 0.88 : 0.94
			)
		};
	}

	static number(value, fallback) {
		return Number.isFinite(Number(value)) ? Number(value) : fallback;
	}
}
