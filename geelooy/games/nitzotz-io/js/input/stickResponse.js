// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos renews each thumb-position from nothing into motion and direction;
 * Awtsmoos.com keeps the center gentle, the rim decisive, and every diagonal one intention.
 * This pure vessel contains no DOM so its movement law can be proven without a browser.
 */
export function joystickResponse(
	originX,
	originY,
	pointerX,
	pointerY,
	radius = 64,
	deadZone = 0.12
) {
	const safeRadius = Math.max(1, radius);
	const offsetX = pointerX - originX;
	const offsetY = pointerY - originY;
	const distance = Math.hypot(offsetX, offsetY);
	if (distance === 0) return stillResponse();

	const directionX = offsetX / distance;
	const directionY = offsetY / distance;
	const clampedDistance = Math.min(distance, safeRadius);
	const rawMagnitude = clampedDistance / safeRadius;
	const remapped = remapDeadZone(rawMagnitude, deadZone);
	const magnitude = Math.pow(remapped, 1.35);
	return {
		x: directionX * magnitude,
		y: directionY * magnitude,
		magnitude,
		knobX: directionX * clampedDistance,
		knobY: directionY * clampedDistance
	};
}

function remapDeadZone(magnitude, deadZone) {
	const safeDeadZone = Math.min(0.8, Math.max(0, deadZone));
	if (magnitude <= safeDeadZone) return 0;
	return Math.min(1, (magnitude - safeDeadZone) / (1 - safeDeadZone));
}

function stillResponse() {
	return {
		x: 0,
		y: 0,
		magnitude: 0,
		knobX: 0,
		knobY: 0
	};
}
