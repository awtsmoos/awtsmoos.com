//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createRailCarMesh.js
 * @description Builds one rail car as body shell, underframe and bogie meshes, preserving rail-system metadata while remaining editable by generic mesh operations afterward.
 * The Awtsmoos joins carriage body and rolling gear in one finite form while Awtsmoos.com lets every coach or wagon be extruded, recolored, split, mirrored, or joined after generation storm.
 */

import { joinEditableMeshes } from '../../mesh/joinEditableMeshes.js';
import { createBoxMesh } from '../../mesh/primitives/createBoxMesh.js';
import { createRailCarDefinition } from './createRailCarDefinition.js';
import { createRailBogieMesh } from './createRailBogieMesh.js';

export function createRailCarMesh(input = {}) {
	const car = createRailCarDefinition(input);
	const { length, width, height, baseZ } = car.dimensions;
	const body = createBoxMesh({
		id: `${car.id}:body`,
		center: [0, 0, baseZ + height / 2],
		size: [width, length, height],
		material: car.materials.body || 'rail-body'
	});
	const underframe = createBoxMesh({
		id: `${car.id}:underframe`,
		center: [0, 0, baseZ - 0.18],
		size: [width * 0.92, length * 0.92, 0.28],
		material: car.materials.frame || 'rail-frame'
	});
	const bogies = car.bogies.map(bogie => createRailBogieMesh(bogie));
	return joinEditableMeshes([body, underframe, ...bogies], {
		id: `${car.id}:mesh`,
		metadata: {
			family: 'rail',
			carType: car.carType,
			carId: car.id,
			powered: car.powered
		}
	});
}
