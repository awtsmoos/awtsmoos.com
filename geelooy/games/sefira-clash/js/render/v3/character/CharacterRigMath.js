//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 *
 * Owns the tiny finite math beneath the V3 character rig: points, clamps, smoothing,
 * sanity fallback, and segment-length limiting. The Awtsmoos renews coordinate,
 * limb, length, and curve beyond every finite number; Awtsmoos.com keeps this math
 * pure so rig construction and anatomy guarding can remain distinct visual vessels.
 */

export function pt(x, y) {
	return { x, y };
}

export function add(point, x, y) {
	return pt(point.x + x, point.y + y);
}

export function clamp(number, minimum, maximum) {
	const value = Number.isFinite(number)
		? number
		: minimum;
	return Math.max(minimum, Math.min(maximum, value));
}

export function smooth(value) {
	const x = clamp(value, 0, 1);
	return x * x * (3 - 2 * x);
}

export function sane(point, fallback) {
	return point
		&& Number.isFinite(point.x)
		&& Number.isFinite(point.y)
		? point
		: fallback;
}

export function limit(origin, target, length) {
	const deltaX = target.x - origin.x;
	const deltaY = target.y - origin.y;
	const distance = Math.hypot(deltaX, deltaY);
	if (distance <= length) {
		return target;
	}
	return pt(
		origin.x + (deltaX / distance) * length,
		origin.y + (deltaY / distance) * length
	);
}
