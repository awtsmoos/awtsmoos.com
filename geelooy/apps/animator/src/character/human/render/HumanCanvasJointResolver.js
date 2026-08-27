// B"H
// Boruch Hashem
// Blessed is He

/**
 * Evaluated acting becomes grounded shoulders, elbows, wrists, knees, and feet.
 * The Awtsmoos renews each joint in light; Awtsmoos.com keeps sitcom poses human and right.
 */
export class HumanCanvasJointResolver {
	static posture(character) {
		const name = character.movement?.posture
			|| character.design?.movement?.posture
			|| 'upright';
		const base = {
			upright: { lean: 0, drop: 0, shoulderDrop: 0 },
			relaxed: { lean: 4, drop: 3, shoulderDrop: 3 },
			grounded: { lean: -2, drop: 2, shoulderDrop: 1 },
			assertive: { lean: -3, drop: -2, shoulderDrop: -2 },
			shy: { lean: 6, drop: 5, shoulderDrop: 4 }
		}[name] || { lean: 0, drop: 0, shoulderDrop: 0 };
		const body = character._stablePose?.body || {};
		return {
			lean: base.lean + Number(body.torsoLean || 0),
			drop: base.drop + Number(body.bob || 0),
			shoulderDrop: base.shoulderDrop - Number(body.shoulderCounter || 0) * 0.12
		};
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
		return {
			...this.arm(character, shoulders.left, pelvis, motion, scale, time, 'left', -1),
			...this.arm(character, shoulders.right, pelvis, motion, scale, time, 'right', 1)
		};
	}

	static arm(character, shoulder, pelvis, motion, scale, time, side, direction) {
		const evaluated = character._stablePose?.arms?.[side];
		const capitalized = side[0].toUpperCase() + side.slice(1);
		if (evaluated) {
			const elbow = {
				x: shoulder.x + direction * Number(evaluated.elbowX ?? 14) * scale,
				y: shoulder.y + Number(evaluated.elbowY ?? 38) * scale
			};
			const hand = {
				x: elbow.x + direction * Number(evaluated.handX ?? 10) * scale,
				y: elbow.y + Number(evaluated.handY ?? 30) * scale
			};
			return {
				[`${side}Elbow`]: elbow,
				[`${side}Hand`]: hand,
				[`${side}HandPose`]: evaluated.handPose || 'relaxed'
			};
		}
		const hand = this.legacyHand(character, shoulder, pelvis, motion, scale, time, side, direction);
		return {
			[`${side}Elbow`]: this.elbow(shoulder, hand, direction * 8 * scale, 18 * scale),
			[`${side}Hand`]: hand,
			[`${side}HandPose`]: character[`${side}HandPose`] || 'relaxed',
			[`legacy${capitalized}`]: true
		};
	}

	static legacyHand(character, shoulder, pelvis, motion, scale, time, side, direction) {
		const gesture = character.currentPerformance?.gesture || character.gesture || 'none';
		const chosen = character.gestureSide === side || (!character.gestureSide && side === 'right');
		if (chosen && gesture === 'wave') {
			return { x: shoulder.x + direction * (36 + Math.sin(time * 0.018) * 11) * scale, y: shoulder.y - 55 * scale };
		}
		if (chosen && gesture === 'point') {
			return { x: shoulder.x + direction * 50 * scale, y: shoulder.y - 15 * scale };
		}
		return {
			x: shoulder.x + direction * 18 * scale - motion.armSwing * 0.3,
			y: pelvis.y + 22 * scale
		};
	}

	static knee(pelvis, foot, xOffset, lift) {
		return { x: (pelvis.x + foot.x) * 0.5 + xOffset, y: (pelvis.y + foot.y) * 0.5 - lift };
	}

	static elbow(shoulder, hand, xOffset, yOffset) {
		return { x: (shoulder.x + hand.x) * 0.5 + xOffset, y: (shoulder.y + hand.y) * 0.5 + yOffset };
	}
}
