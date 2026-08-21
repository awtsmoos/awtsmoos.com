// B"H
// Boruch Hashem
// Blessed is He

const FOLLOW_THRESHOLD = 1.35;
const RETAINED_DEFLECTION = 1.05;

/**
 * The Awtsmoos lets a distant thumb draw its vessel forward without disturbing nearby stillness;
 * Awtsmoos.com preserves a faithful center for precision, then follows only when long motion asks for room.
 * The returned origin remains collinear with the pointer so direction never bends during the revelation.
 */
export function followStickOrigin(
	originX,
	originY,
	pointerX,
	pointerY,
	radius = 64
) {
	const safeRadius = Math.max(1, radius);
	const offsetX = pointerX - originX;
	const offsetY = pointerY - originY;
	const distance = Math.hypot(offsetX, offsetY);
	if (!distance || distance <= safeRadius * FOLLOW_THRESHOLD) {
		return unchanged(originX, originY);
	}

	const directionX = offsetX / distance;
	const directionY = offsetY / distance;
	const retainedDistance = safeRadius * RETAINED_DEFLECTION;
	return {
		x: pointerX - directionX * retainedDistance,
		y: pointerY - directionY * retainedDistance,
		changed: true
	};
}

function unchanged(x, y) {
	return {
		x,
		y,
		changed: false
	};
}
