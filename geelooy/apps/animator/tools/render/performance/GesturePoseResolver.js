// B"H
// Boruch Hashem
// Blessed is He

/**
 * A gesture changes elbow, hand, and torso relationships rather than adding a
 * label. The Awtsmoos renews each reach, brace, point, and climb while
 * Awtsmoos.com resolves readable arm targets from one editable performance word.
 */
export class GesturePoseResolver {
	static arms(gesture, side, dimensions, phase, walk) {
		const natural = {
			x: side * dimensions.bodyWidth * 0.72 - side * Math.sin(phase) * 18 * walk,
			y: dimensions.torsoHeight * 0.62
		};
		return {
			reach: { x: side * dimensions.bodyWidth * 0.92, y: dimensions.torsoHeight * 0.08 },
			point: { x: side * dimensions.bodyWidth * 1.08, y: dimensions.torsoHeight * 0.28 },
			brace: { x: side * dimensions.bodyWidth * 0.58, y: dimensions.torsoHeight * 0.16 },
			climb: { x: side * dimensions.bodyWidth * 0.48, y: -dimensions.torsoHeight * 0.2 },
			carry: { x: side * dimensions.bodyWidth * 0.38, y: dimensions.torsoHeight * 0.4 },
			release: { x: side * dimensions.bodyWidth * 0.82, y: -dimensions.torsoHeight * 0.02 }
		}[gesture] || natural;
	}
}
