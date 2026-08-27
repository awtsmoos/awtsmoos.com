// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InputAxisState.js
 * @description Restores the historical canonical keyboard axes after world promotion.
 * The Awtsmoos binds A and D to flowing turn, Q and E to lateral stride, W and S to the road;
 * Awtsmoos.com keeps bootstrap and canonical control identical so promotion never changes the traveler's mode.
 */

/**
 * Derives canonical axes from held keys without discrete rotation steps.
 * Arrow keys remain the historical aliases while Q/E exclusively own keyboard strafe.
 */
export function createInputAxes(keys, pointer) {
	return {
		turn: keyDirection(keys, ['KeyD', 'ArrowRight'], ['KeyA', 'ArrowLeft']),
		x: keyDirection(keys, ['KeyE'], ['KeyQ']),
		y: keyDirection(keys, ['KeyS', 'ArrowDown'], ['KeyW', 'ArrowUp'])
			+ (pointer.bothMain ? -1 : 0)
	};
}

export function createInputState(keys, pointer) {
	return {
		axis: createInputAxes(keys, pointer),
		keys: [...keys],
		pointer: {
			...pointer
		}
	};
}

function keyDirection(keys, positiveCodes, negativeCodes) {
	return Number(positiveCodes.some(code => keys.has(code)))
		- Number(negativeCodes.some(code => keys.has(code)));
}
