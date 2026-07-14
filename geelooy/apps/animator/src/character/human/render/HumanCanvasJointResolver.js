// B"H
// Boruch Hashem
// Blessed is He

/**
 * Posture and performance become shoulders, knees, elbows, wrists, and feet. The
 * Awtsmoos renews balance in every frame while Awtsmoos.com keeps joint solving
 * independent from the higher-level body composition.
 */
export class HumanCanvasJointResolver {
	static posture(character) {
		const name = character.movement?.posture
			|| character.design?.movement?.posture
			|| 'upright';
		return {
			upright: { lean: 0, drop: 0, shoulderDrop: 0 },
			relaxed: { lean: 4, drop: 3, shoulderDrop: 3 },
			grounded: { lean: -2, drop: 2, shoulderDrop: 1 },
			assertive: { lean: -3, drop: -2, shoulderDrop: -2 },
			shy: { lean: 6, drop: 5, shoulderDrop: 4 }
		}[name] || { lean: 0, drop: 0, shoulderDrop: 0 };
	}

	static shoulders(chest, profile, scale, posture) {
		const y = chest.y + 8 * scale + posture.shoulderDrop * scale;
		return {
			left: { x: chest.x - profile.shoulder * 0.5, y },
			right: { x: chest.x + profile.shoulder * 0.5, y }
		};
	}

	static feet(x, footY, pelvis, profile, motion, scale) {
		const left = {
			x: x - profile.hip * 0.42 + motion.left.x,
			y: footY + motion.left.y
		};
		const right = {
			x: x + profile.hip * 0.42 + motion.right.x,
			y: footY + motion.right.y
		};
		return {
			left,
			right,
			leftKnee: this.knee(pelvis, left, -8 * scale, motion.left.knee),
			rightKnee: this.knee(pelvis, right, 8 * scale, motion.right.knee)
		};
	}

	static arms(character, shoulders, pelvis, motion, scale, time) {
		const gesture = character.currentPerformance?.gesture
			|| character.gesture
			|| 'none';
		const gestureScale = Number(character.movement?.gestureScale || 1);
		const wave = gesture === 'wave';
		const point = gesture === 'point';
		const leftHand = {
			x: shoulders.left.x - 18 * scale - motion.armSwing * 0.3,
			y: pelvis.y + 22 * scale
		};
		const rightHand = this.rightHand(
			shoulders.right,
			pelvis,
			motion,
			scale,
			time,
			gestureScale,
			wave,
			point
		);
		return {
			leftHand,
			rightHand,
			leftElbow: this.elbow(shoulders.left, leftHand, -8 * scale, 18 * scale),
			rightElbow: this.elbow(shoulders.right, rightHand, 8 * scale, (wave ? -4 : 18) * scale)
		};
	}

	static rightHand(shoulder, pelvis, motion, scale, time, gestureScale, wave, point) {
		if (!wave && !point) {
			return {
				x: shoulder.x + 18 * scale - motion.armSwing * 0.3,
				y: pelvis.y + 22 * scale
			};
		}
		return {
			x: shoulder.x + (wave ? 36 : 50) * scale * gestureScale
				+ Math.sin(time * 0.018) * (wave ? 11 : 2) * scale,
			y: shoulder.y - (wave ? 55 : 15) * scale * gestureScale
		};
	}

	static knee(pelvis, foot, xOffset, lift) {
		return {
			x: (pelvis.x + foot.x) * 0.5 + xOffset,
			y: (pelvis.y + foot.y) * 0.5 - lift
		};
	}

	static elbow(shoulder, hand, xOffset, yOffset) {
		return {
			x: (shoulder.x + hand.x) * 0.5 + xOffset,
			y: (shoulder.y + hand.y) * 0.5 + yOffset
		};
	}
}
