// B"H
// Boruch Hashem
// Blessed is He
/** Grid motion yields only where a signed solid boundary forbids inward flow. */

import { createVectorGrid3d, gridPoint3d } from "../volumes/grid3d.js";
import { createSolidCollider3d } from "./createSolidCollider3d.js";
import { sampleSolidCollider3d } from "./sampleSolidCollider3d.js";

function dot(left, right) {
	return left.reduce((sum, value, axis) => sum + value * right[axis], 0);
}

function constrainVelocity(velocity, sample) {
	const relative = velocity.map((value, axis) => (
		value - sample.collider.velocity[axis]
	));
	const normalSpeed = dot(relative, sample.normal);
	if (normalSpeed >= 0) {
		return velocity;
	}
	const tangent = relative.map((value, axis) => (
		value - sample.normal[axis] * normalSpeed
	));
	const tangentScale = 1 - sample.collider.friction;
	return velocity.map((_, axis) => (
		sample.collider.velocity[axis] + tangent[axis] * tangentScale
	));
}

function normalizeColliders(values = []) {
	return values.map(createSolidCollider3d)
		.sort((left, right) => left.id.localeCompare(right.id));
}

export function constrainLiquidGridToSolids3d(
	velocityGrid,
	colliderInputs = [],
	options = {}
) {
	const colliders = normalizeColliders(colliderInputs);
	const boundaryWidth = Math.max(
		0,
		Number(options.solidBoundaryWidth ?? velocityGrid.cellSize)
	);
	const xValues = [...velocityGrid.x];
	const yValues = [...velocityGrid.y];
	const zValues = [...velocityGrid.z];
	let constrainedCellCount = 0;
	let interiorCellCount = 0;
	let index = 0;
	for (let z = 0; z < velocityGrid.depth; z += 1) {
		for (let y = 0; y < velocityGrid.height; y += 1) {
			for (let x = 0; x < velocityGrid.width; x += 1) {
				const point = gridPoint3d(velocityGrid, x, y, z);
				let velocity = [xValues[index], yValues[index], zValues[index]];
				let constrained = false;
				let interior = false;
				for (const collider of colliders) {
					const sample = sampleSolidCollider3d(collider, point);
					if (sample.distance < 0) {
						velocity = [...sample.collider.velocity];
						constrained = true;
						interior = true;
						continue;
					}
					if (sample.distance <= boundaryWidth) {
						const next = constrainVelocity(velocity, sample);
						constrained ||= next.some((value, axis) => value !== velocity[axis]);
						velocity = next;
					}
				}
				xValues[index] = velocity[0];
				yValues[index] = velocity[1];
				zValues[index] = velocity[2];
				constrainedCellCount += constrained ? 1 : 0;
				interiorCellCount += interior ? 1 : 0;
				index += 1;
			}
		}
	}
	return Object.freeze({
		velocityGrid: createVectorGrid3d({
			...velocityGrid,
			x: xValues,
			y: yValues,
			z: zValues
		}),
		constrainedCellCount,
		interiorCellCount,
		colliderIds: Object.freeze(colliders.map(collider => collider.id))
	});
}
