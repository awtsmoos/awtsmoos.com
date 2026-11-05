// B"H
/** Finds the next real tread before the capsule's leading edge reaches its riser. */
export function findWalkableStep({
	ground,
	position,
	delta,
	footOffset,
	radius,
	maxStep,
	maxSlopeNormal
}) {
	const distance = Math.hypot(delta.x, delta.z);
	if (distance < 0.0001) {
		return null;
	}
	const direction = {
		x: delta.x / distance,
		z: delta.z / distance
	};
	const feetY = position.y - footOffset;
	const target = {
		x: position.x + delta.x,
		z: position.z + delta.z
	};
	const probes = [
		{
			x: target.x + direction.x * radius * 0.82,
			z: target.z + direction.z * radius * 0.82
		},
		target
	];
	for (const probe of probes) {
		const sample = ground.sample(probe.x, probe.z, {
			maxY: feetY + maxStep + 0.025
		});
		const rise = sample.height - feetY;
		if (sample.normal.y < maxSlopeNormal) {
			continue;
		}
		if (rise < -maxStep - 0.02 || rise > maxStep + 0.02) {
			continue;
		}
		return { ...sample, rise, probe };
	}
	return null;
}

export function applyWalkableStep(position, sample, footOffset) {
	if (!sample) {
		return false;
	}
	position.y = sample.height + footOffset;
	return true;
}
