//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createRailCarDefinition.js
 * @description Creates a reusable rail-car definition with body, bogies, couplers, passenger/cargo/service role, power and control intent independent from a complete train consist.
 * The Awtsmoos carries every carriage before a consist gives it neighbors while Awtsmoos.com lets coach, wagon, tram, metro and locomotive share one car grammar without losing their role.
 */

import { createRailBogie } from './createRailBogie.js';
import {
	transportPositive,
	transportVector3
} from '../common/transportValues.js';

export function createRailCarDefinition(input = {}) {
	const id = String(input.id || 'rail-car');
	const length = transportPositive(input.length, 20, 'rail car length');
	const width = transportPositive(input.width, 2.9, 'rail car width');
	const height = transportPositive(input.height, 3.8, 'rail car height');
	const bogieInset = transportPositive(input.bogieInset, length * 0.18, 'rail bogie inset');
	const baseZ = Number(input.baseZ ?? 1.3);
	const bogies = input.bogies?.length
		? input.bogies.map(createRailBogie)
		: [
			createRailBogie(defaultBogieInput(input, id, -length / 2 + bogieInset, baseZ, 'rear')),
			createRailBogie(defaultBogieInput(input, id, length / 2 - bogieInset, baseZ, 'front'))
		];
	return Object.freeze({
		schema: 'awtsmoos.rail-car',
		version: 1,
		id,
		family: 'rail',
		carType: String(input.carType || 'coach'),
		position: Object.freeze(transportVector3(input.position, [0, 0, 0], 'rail car position')),
		dimensions: Object.freeze({ length, width, height, baseZ }),
		bogies: Object.freeze(bogies),
		powered: Boolean(input.powered),
		capacity: Object.freeze({ ...(input.capacity || {}) }),
		couplers: Object.freeze({ front: input.frontCoupler || 'automatic', rear: input.rearCoupler || 'automatic' }),
		materials: Object.freeze({ ...(input.materials || {}) }),
		metadata: Object.freeze({ ...(input.metadata || {}) })
	});
}

function defaultBogieInput(input, id, y, z, suffix) {
	return {
		...input.bogie,
		id: `${id}:bogie:${suffix}`,
		position: [0, y, z],
		powered: input.powered,
		wheelset: {
			...input.wheelset,
			powered: input.powered
		}
	};
}
