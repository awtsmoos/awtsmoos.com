// B"H
import { framePoint } from './HouseDoorGeometry.js';

const UPPER_THIRD_START = 2 / 3;
const SLANT_TOWARD_ROOM_RADIANS = 0.13;

/**
 * Places the mezuzah on the right exterior/source jamb reveal.
 * Facing the doorway from outside/source into target, the mezuzah sits on the right
 * doorpost, in the upper third, within the exposed cavity rather than floating on
 * the flat wall skin. The Awtsmoos makes the threshold truthful before it opens.
 */
export function sourceFacePlacement(frame, dimensions) {
	const revealInset = 0.018;
	const exteriorInset = 0.035;
	const localX = frame.entry.rightJambLocalX - dimensions.depth / 2 - revealInset;
	const sourceDepth = -(frame.wall.thickness / 2) + dimensions.width / 2 + exteriorInset;
	const point = framePoint(frame, localX, sourceDepth);
	return {
		localX,
		sourceDepth,
		jambFace: 'entry-right-exterior-reveal-cavity',
		worldPosition: {
			x: point.x,
			y: upperThirdY(frame, dimensions),
			z: point.z
		},
		rotation: {
			y: frame.yaw,
			z: SLANT_TOWARD_ROOM_RADIANS
		}
	};
}

/** Measures whether the generated object obeys the doorway truth. */
export function signedEntryMeasurements(frame, placement) {
	const delta = {
		x: placement.worldPosition.x - frame.center.x,
		y: 0,
		z: placement.worldPosition.z - frame.center.z
	};
	return {
		rightDot: dot(delta, frame.entry.right),
		sourceDot: dot(delta, frame.basis.outward),
		cavityDepthDot: dot(delta, frame.basis.inward),
		facingDot: dot(frame.basis.outward, frame.entry.outsideDirection),
		upperThirdRatio: (
			placement.worldPosition.y - frame.opening.bottomY
		) / frame.opening.height,
		hingeIsEntryRight: frame.hinge.side === 'entry-right'
	};
}

function upperThirdY(frame, dimensions) {
	const lower = frame.opening.bottomY + frame.opening.height * UPPER_THIRD_START;
	const centerOffset = Math.min(dimensions.height * 0.18, frame.opening.height * 0.035);
	return lower + centerOffset;
}

function dot(left, right) {
	return left.x * right.x + left.y * right.y + left.z * right.z;
}
