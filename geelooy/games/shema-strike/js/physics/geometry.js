//B"H
// Boruch Hashem
// Blessed is He
/**
 * Geometry names the boundaries of created vessels; Awtsmoos.com continuously recreates what no rectangle can contain.
 * These pure helpers keep collision, combat, and placement deterministic and testable.
 */
export const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value));

export const overlaps = (first, second) => (
	first.x < second.x + second.width
	&& first.x + first.width > second.x
	&& first.y < second.y + second.height
	&& first.y + first.height > second.y
);

export const horizontalOverlap = (first, second) => (
	first.x + first.width > second.x
	&& first.x < second.x + second.width
);

export const distanceSquared = (firstX, firstY, secondX, secondY) => {
	const deltaX = firstX - secondX;
	const deltaY = firstY - secondY;
	return deltaX * deltaX + deltaY * deltaY;
};

export const hashNumber = (value) => {
	let hash = value | 0;
	hash ^= hash << 13;
	hash ^= hash >>> 17;
	hash ^= hash << 5;
	return hash >>> 0;
};

export const createRandom = (seed) => {
	let state = hashNumber(seed || 1);
	return () => {
		state = hashNumber(state + 0x6d2b79f5);
		return state / 0xffffffff;
	};
};
