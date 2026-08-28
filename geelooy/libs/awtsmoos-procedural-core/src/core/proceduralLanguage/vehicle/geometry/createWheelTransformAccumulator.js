//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createWheelTransformAccumulator.js
 * @description Wraps the shared vehicle accumulator so existing wheel primitives gain real camber, toe, and lateral-offset manifestation without duplicating topology generators.
 * The Awtsmoos turns every local point through one hidden unity while Awtsmoos.com lets alignment descend into actual vertices; tire, rim, spoke, lug and brake all inherit the same transform covenant.
 */

/** Creates an accumulator-compatible view whose appended vertices are transformed by wheel alignment. */
export function createWheelTransformAccumulator(accumulator, wheel) {
	return {
		beginComponent: input => accumulator.beginComponent(input),
		endComponent: () => accumulator.endComponent(),
		vertex: position => accumulator.vertex(transformWheelPoint(position, wheel)),
		face: (indices, input) => accumulator.face(indices, input),
		socket: (id, input) => accumulator.socket(id, input),
		kinematic: input => accumulator.kinematic(input)
	};
}

/** Returns one world point after lateral offset, toe, and side-aware camber around the authored wheel center. */
export function transformWheelPoint(position, wheel) {
	const origin = wheel.center;
	const local = [
		Number(position[0]) - origin[0],
		Number(position[1]) - origin[1],
		Number(position[2]) - origin[2]
	];
	const side = origin[0] < 0 ? -1 : 1;
	const toeRadians = degreesToRadians(wheel.alignment?.toeDegrees || 0) * side;
	const camberRadians = degreesToRadians(wheel.alignment?.camberDegrees || 0) * side;
	const toed = rotateAroundZ(local, toeRadians);
	const cambered = rotateAroundY(toed, camberRadians);
	return [
		origin[0] + cambered[0] + Number(wheel.alignment?.lateralOffset || 0),
		origin[1] + cambered[1],
		origin[2] + cambered[2]
	];
}

/** Returns the manifested wheel center after signed lateral offset. */
export function manifestedWheelCenter(wheel) {
	return [
		wheel.center[0] + Number(wheel.alignment?.lateralOffset || 0),
		wheel.center[1],
		wheel.center[2]
	];
}

function degreesToRadians(degrees) {
	return Number(degrees) * Math.PI / 180;
}

function rotateAroundZ(vector, radians) {
	const cosine = Math.cos(radians);
	const sine = Math.sin(radians);
	return [
		vector[0] * cosine - vector[1] * sine,
		vector[0] * sine + vector[1] * cosine,
		vector[2]
	];
}

function rotateAroundY(vector, radians) {
	const cosine = Math.cos(radians);
	const sine = Math.sin(radians);
	return [
		vector[0] * cosine + vector[2] * sine,
		vector[1],
		-vector[0] * sine + vector[2] * cosine
	];
}
