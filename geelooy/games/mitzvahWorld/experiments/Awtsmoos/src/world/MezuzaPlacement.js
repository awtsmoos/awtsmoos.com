// B"H
import { framePoint } from './HouseDoorGeometry.js';

/**
 * Places the mezuzah on the source-side wall face beside the opening.
 * The entering traveler sees it before crossing the threshold.
 */
export function sourceFacePlacement(frame, dimensions) {
	const localX = frame.entry.rightJambLocalX + dimensions.width / 2 + 0.055;
	const sourceDepth = -(frame.wall.thickness / 2 + dimensions.depth / 2 + 0.018);
	const point = framePoint(frame, localX, sourceDepth);
	return {
		localX,
		sourceDepth,
		worldPosition: {
			x: point.x,
			y: frame.opening.bottomY + frame.opening.height * 0.69,
			z: point.z
		},
		rotation: {
			y: frame.yaw,
			z: 0.13
		}
	};
}

export function signedEntryMeasurements(frame, placement) {
	const delta = {
		x: placement.worldPosition.x - frame.center.x,
		y: 0,
		z: placement.worldPosition.z - frame.center.z
	};
	return {
		rightDot: dot(delta, frame.entry.right),
		sourceDot: dot(delta, frame.basis.outward),
		facingDot: dot(frame.basis.outward, frame.entry.outsideDirection)
	};
}

function dot(left, right) {
	return left.x * right.x + left.y * right.y + left.z * right.z;
}
