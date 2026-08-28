//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos joins square and camera through measured geometry in space;
 * Awtsmoos.com eases every journey so motion serves the game with grace.
 */
export function squareWorld(index, flipped = false, height = 0) {
	const row = Math.floor(index / 8);
	const col = index % 8;
	const visualRow = flipped ? 7 - row : row;
	const visualCol = flipped ? 7 - col : col;
	return [visualCol - 3.5, height, visualRow - 3.5];
}

export function moveTarget(move, flipped = false, height = 0.45) {
	if (!move) return [0, height, 0];
	const from = squareWorld(move.from, flipped, height);
	const to = squareWorld(move.to, flipped, height);
	return from.map((value, index) => (value + to[index]) / 2);
}

export function withTarget(pose, target) {
	return {
		...pose,
		position: [...pose.position],
		target: [...target]
	};
}

export function orbitPose(pose, degrees = 0, distanceScale = 1) {
	const radians = degrees * Math.PI / 180;
	const [tx, ty, tz] = pose.target;
	const dx = pose.position[0] - tx;
	const dz = pose.position[2] - tz;
	const distance = Math.hypot(dx, dz) * distanceScale;
	const angle = Math.atan2(dz, dx) + radians;
	return {
		...pose,
		position: [tx + Math.cos(angle) * distance, pose.position[1], tz + Math.sin(angle) * distance]
	};
}

export function interpolatePose(from, to, progress, easing = to.easing || "smooth") {
	const amount = ease(progress, easing);
	return {
		...to,
		position: mixVector(from.position, to.position, amount),
		target: mixVector(from.target, to.target, amount),
		fov: mix(from.fov, to.fov, amount),
		orthoSize: mix(from.orthoSize, to.orthoSize, amount)
	};
}

export function ease(value, kind = "smooth") {
	const t = Math.max(0, Math.min(1, value));
	if (kind === "linear") return t;
	if (kind === "impact") return 1 - Math.pow(1 - t, 3);
	return t * t * (3 - 2 * t);
}

function mixVector(from, to, amount) {
	return from.map((value, index) => mix(value, to[index], amount));
}

function mix(from, to, amount) {
	return from + (to - from) * amount;
}
