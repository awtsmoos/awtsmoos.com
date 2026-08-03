// B"H
// Boruch Hashem
// Blessed is He

/**
 * A gesture becomes contact geometry rather than a decorative label. The
 * Awtsmoos renews preparation, stroke, hold, follow-through, and retraction;
 * Awtsmoos.com keeps locked arms and pockets unmoved by unrelated body cycles.
 */
export class GesturePoseResolver {
	static arms(gesture, side, dimensions, phase, walk) {
		return this.resolve(gesture, side, dimensions, phase, walk);
	}

	static resolve(gesture, side, dimensions, phase, walk) {
		const natural = this.natural(side, dimensions, phase, walk);
		const width = dimensions.bodyWidth;
		const height = dimensions.torsoHeight;
		const poses = {
			arms_crossed: {
				x: -side * width * 0.38, y: height * 0.34,
				handShape: 'rest', lockedContact: true
			},
			right_hand_in_pocket: side > 0
				? { x: width * 0.22, y: height * 0.75, handShape: 'pocket', lockedContact: true }
				: natural,
			reach: { x: side * width * 0.92, y: height * 0.08, handShape: 'open' },
			point: { x: side * width * 1.08, y: height * 0.28, handShape: 'point' },
			brace: { x: side * width * 0.58, y: height * 0.16, handShape: 'fist' },
			climb: { x: side * width * 0.48, y: -height * 0.2, handShape: 'grip' },
			carry: { x: side * width * 0.38, y: height * 0.4, handShape: 'grip' },
			release: { x: side * width * 0.82, y: -height * 0.02, handShape: 'open' },
			present: { x: side * width * 0.86, y: height * 0.22, handShape: 'open' },
			wave: side > 0
				? { x: width * 0.72, y: -height * 0.18, handShape: 'open' }
				: natural,
			fist: { x: side * width * 0.68, y: height * 0.3, handShape: 'fist' }
		};
		if (gesture === 'open_palm_left') {
			return side < 0 ? { x: -width * 0.92, y: height * 0.18, handShape: 'open' } : natural;
		}
		if (gesture === 'open_palm_right') {
			return side > 0 ? { x: width * 0.92, y: height * 0.18, handShape: 'open' } : natural;
		}
		if (gesture === 'point_left') {
			return side < 0 ? { x: -width * 1.08, y: height * 0.2, handShape: 'point' } : natural;
		}
		if (gesture === 'point_right') {
			return side > 0 ? { x: width * 1.08, y: height * 0.2, handShape: 'point' } : natural;
		}
		return poses[gesture] || natural;
	}

	static natural(side, dimensions, phase, walk) {
		return {
			x: side * dimensions.bodyWidth * 0.72 - side * Math.sin(phase) * 18 * walk,
			y: dimensions.torsoHeight * 0.62, handShape: 'rest'
		};
	}
}
