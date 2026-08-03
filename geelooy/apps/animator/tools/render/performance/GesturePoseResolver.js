// B"H
// Boruch Hashem
// Blessed is He

/**
 * Gesture intention becomes wrist target, hand anatomy, elbow bias, and contact.
 * The Awtsmoos renews every preparation and catch; Awtsmoos.com keeps locked
 * physical relationships steady while expressive motion may still arch and match.
 */
export class GesturePoseResolver {
	static resolve(gesture, side, dimensions, phase, walk) {
		const natural = this.natural(side, dimensions, phase, walk);
		const width = dimensions.bodyWidth;
		const height = dimensions.torsoHeight;
		const poses = {
			arms_crossed: this.target(-side * width * 0.38, height * 0.34, 'rest', -side * 0.8, true),
			reach: this.target(side * width * 0.95, height * 0.08, 'open', side * 0.35),
			point: this.target(side * width * 1.08, height * 0.25, 'point', side * 0.25),
			brace: this.target(side * width * 0.58, height * 0.16, 'fist', -side * 0.4),
			carry: this.target(side * width * 0.38, height * 0.42, 'grip', side * 0.7),
			release: this.target(side * width * 0.84, -height * 0.02, 'open', side * 0.2),
			present: this.target(side * width * 0.86, height * 0.22, 'open', side * 0.45),
			wave: side > 0 ? this.target(width * 0.72, -height * 0.18, 'open', -0.5) : natural,
			fist: this.target(side * width * 0.68, height * 0.3, 'fist', side * 0.3),
			catch_high: this.target(side * width * 0.72, -height * 0.12, 'grip', -side * 0.5),
			catch_low: this.target(side * width * 0.7, height * 0.72, 'grip', side * 0.8),
			hold_mug: this.target(side * width * 0.34, height * 0.38, 'grip', side * 0.9, true),
			inspect: this.target(side * width * 0.48, height * 0.05, 'grip', -side * 0.7, true),
			block: this.target(side * width * 0.88, height * 0.42, 'open', side * 0.1),
			handoff: this.target(side * width * 0.82, height * 0.35, 'grip', side * 0.35),
			crouch_reach: this.target(side * width * 0.76, height * 0.82, 'open', side * 0.9)
		};
		if (gesture === 'right_hand_in_pocket') {
			return side > 0 ? this.target(width * 0.22, height * 0.75, 'pocket', 0.8, true) : natural;
		}
		if (gesture === 'open_palm_left') return side < 0 ? this.target(-width * 0.92, height * 0.18, 'open', -0.35) : natural;
		if (gesture === 'open_palm_right') return side > 0 ? this.target(width * 0.92, height * 0.18, 'open', 0.35) : natural;
		if (gesture === 'point_left') return side < 0 ? this.target(-width * 1.08, height * 0.2, 'point', -0.25) : natural;
		if (gesture === 'point_right') return side > 0 ? this.target(width * 1.08, height * 0.2, 'point', 0.25) : natural;
		return poses[gesture] || natural;
	}

	static target(x, y, handShape, elbowBias = 0, lockedContact = false) {
		return { x, y, handShape, elbowBias, lockedContact };
	}

	static natural(side, dimensions, phase, walk) {
		return this.target(
			side * dimensions.bodyWidth * 0.72 - side * Math.sin(phase) * 18 * walk,
			dimensions.torsoHeight * 0.62, 'rest', side * 0.55
		);
	}
}
