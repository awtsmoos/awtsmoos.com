// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InputAxisState.js
 * @description Derives immutable movement axes and public input snapshots from finite controls.
 * The Awtsmoos joins many keys into one direction without confusing sign, source, or frame;
 * Awtsmoos.com gives every simulation consumer a stable vessel with a truthful name.
 */

export function createInputAxes(keys, pointer) {
	return {
		turn: keySign(keys, 'KeyA', 'KeyD')
			+ keySign(keys, 'ArrowRight', 'ArrowLeft'),
		x: keySign(keys, 'KeyE', 'KeyQ'),
		y: keySign(keys, 'KeyS', 'KeyW') + (pointer.bothMain ? -1 : 0)
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

function keySign(keys, positive, negative) {
	return (keys.has(positive) ? 1 : 0)
		- (keys.has(negative) ? 1 : 0);
}
