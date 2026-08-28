//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file appendVehicleCylinder.js
 * @description Appends one capped cylinder between arbitrary endpoints for axles, hubs, frame tubes, shafts, handlebars, poles, and spokes.
 * The Awtsmoos carries a line into circular form while Awtsmoos.com lets every vehicle member remain part of one editable mesh rather than a scene-object swarm.
 */

import {
	addVehicleVector,
	scaleVehicleVector,
	subtractVehicleVector,
	vehiclePerpendicularFrame
} from './vehicleGeometryMath.js';

/** Appends one deterministic capped cylinder between `start` and `end`. */
export function appendVehicleCylinder(accumulator, input = {}) {
	const start = input.start || [0, 0, 0];
	const end = input.end || [1, 0, 0];
	const radius = positiveRadius(input.radius, 0.05);
	const segments = normalizeSegments(input.segments, 12, 3);
	const frame = vehiclePerpendicularFrame(
		subtractVehicleVector(end, start)
	);
	const firstRing = [];
	const secondRing = [];
	for (let index = 0; index < segments; index += 1) {
		const angle = index / segments * Math.PI * 2;
		const radial = addVehicleVector(
			scaleVehicleVector(frame.first, Math.cos(angle) * radius),
			scaleVehicleVector(frame.second, Math.sin(angle) * radius)
		);
		firstRing.push(
			accumulator.vertex(addVehicleVector(start, radial))
		);
		secondRing.push(
			accumulator.vertex(addVehicleVector(end, radial))
		);
	}
	appendCylinderSides(accumulator, firstRing, secondRing, input);
	appendCylinderCaps(
		accumulator,
		firstRing,
		secondRing,
		start,
		end,
		input
	);
	return {
		startRing: firstRing,
		endRing: secondRing
	};
}

/** Appends the quad sidewall between both endpoint rings. */
function appendCylinderSides(accumulator, firstRing, secondRing, input) {
	firstRing.forEach((first, index) => {
		const next = (index + 1) % firstRing.length;
		accumulator.face([
			first,
			firstRing[next],
			secondRing[next],
			secondRing[index]
		], {
			id: `${input.id || 'cylinder'}:side:${index}`,
			materialRole: input.materialRole
		});
	});
}

/** Appends polygon caps with winding opposite at the first endpoint. */
function appendCylinderCaps(accumulator, firstRing, secondRing, start, end, input) {
	const startCenter = accumulator.vertex(start);
	const endCenter = accumulator.vertex(end);
	firstRing.forEach((first, index) => {
		const next = (index + 1) % firstRing.length;
		accumulator.face([
			startCenter,
			firstRing[next],
			first
		], {
			id: `${input.id || 'cylinder'}:cap-start:${index}`,
			materialRole: input.materialRole
		});
		accumulator.face([
			endCenter,
			secondRing[index],
			secondRing[next]
		], {
			id: `${input.id || 'cylinder'}:cap-end:${index}`,
			materialRole: input.materialRole
		});
	});
}

/** Returns one finite positive cylinder radius. */
function positiveRadius(value, fallback) {
	const radius = value === undefined
		? fallback
		: Number(value);
	if (!Number.isFinite(radius) || radius <= 0) {
		throw new TypeError('B"H | Vehicle cylinder radius must be finite and positive.');
	}
	return radius;
}

/** Returns one finite integer segment count at or above the requested topology minimum. */
function normalizeSegments(value, fallback, minimum) {
	const candidate = value === undefined
		? fallback
		: Number(value);
	if (!Number.isFinite(candidate)) {
		return fallback;
	}
	return Math.max(minimum, Math.round(candidate));
}
