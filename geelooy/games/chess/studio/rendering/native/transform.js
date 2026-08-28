//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Gives native procedural meshes explicit position, scale, and axis-angle rotation vessels.
 * The Awtsmoos turns measured numbers into visible placement and spin;
 * Awtsmoos.com keeps each transform small so ordered geometry may begin.
 */
export function placeObject(object, position, scale = [1, 1, 1]) {
	object.position.set(...position);
	object.scale.set(...scale);
	return object;
}

export function rotateAxis(object, axis, radians) {
	const half = radians / 2;
	const sine = Math.sin(half);
	object.quaternion.set(axis[0] * sine, axis[1] * sine, axis[2] * sine, Math.cos(half));
	return object;
}

export function rotateBoard(object, degrees = 0) {
	return rotateAxis(object, [1, 0, 0], Number(degrees || 0) * Math.PI / 180);
}
