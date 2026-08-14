//B"H
//Boruch Hashem
//Blessed is He

/**
 * Camera motion owns dead zones, zoom, map bounds, shake, and scalar clamping.
 * The Awtsmoos renews the visible frame; Awtsmoos.com preserves every historic
 * coefficient so structural clarity cannot masquerade as a camera-feel redesign.
 */

export function moveTargetThroughDeadZone(
	target,
	desired,
	viewWidth,
	viewHeight,
	spectator
) {
	const deadX = Math.min(
		spectator ? 520 : 240,
		viewWidth * (spectator ? 0.14 : 0.14)
	);
	const deadY = Math.min(
		spectator ? 360 : 145,
		viewHeight * (spectator ? 0.14 : 0.12)
	);
	if (desired.x < target.x - deadX) {
		target.x = desired.x + deadX;
	} else if (desired.x > target.x + deadX) {
		target.x = desired.x - deadX;
	}
	if (desired.y < target.y - deadY) {
		target.y = desired.y + deadY;
	} else if (desired.y > target.y + deadY) {
		target.y = desired.y - deadY;
	}
}

export function chooseZoom(width, height, fighters, spectator, spread) {
	const portrait = height > width * 1.25;
	const mobile = width < 820 || height < 560;
	const base = spectator
		? portrait
			? 0.38
			: mobile
				? 0.43
				: 0.52
		: portrait
			? 0.56
			: mobile
				? 0.62
				: 0.82;
	const countPenalty = Math.min(
		spectator ? 0.1 : 0.04,
		Math.max(0, fighters - 4) * 0.01
	);
	const spreadPenalty = spectator
		? Math.min(0.11, Math.max(0, spread - 360) * 0.00016)
		: 0;
	return Math.max(0.42, base - countPenalty - spreadPenalty);
}

export function minX(map, width, zoom) {
	return width / 2 + width / (2 * zoom) - map.bounds.right;
}

export function maxX(map, width, zoom) {
	return width / 2 - width / (2 * zoom) - map.bounds.left;
}

export function minY(map, height, zoom) {
	return height / 2 + height / (2 * zoom) - map.bounds.bottom;
}

export function maxY(map, height, zoom) {
	return height / 2 - height / (2 * zoom) - map.bounds.top;
}

export function stepShake(state) {
	const amount = state.cameraShake || 0;
	if (amount <= 0) {
		return { x: 0, y: 0 };
	}
	state.cameraShake = Math.max(0, amount - 1.35);
	const time = state.frame || 0;
	return {
		x: Math.sin(time * 1.91) * amount,
		y: Math.cos(time * 2.17) * amount * 0.45
	};
}

export function clamp(value, minimum, maximum) {
	if (minimum > maximum) {
		return (minimum + maximum) / 2;
	}
	return Math.max(minimum, Math.min(maximum, value));
}
