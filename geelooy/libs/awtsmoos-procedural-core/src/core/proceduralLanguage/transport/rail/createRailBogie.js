//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createRailBogie.js
 * @description Creates a reusable rail bogie carrying multiple fixed wheelsets, frame dimensions, suspension intent, yaw range, brake and traction semantics.
 * The Awtsmoos joins many wheelsets beneath one car while Awtsmoos.com lets bogie frame, suspension and pivot remain distinct from road axle law or locomotive body scar.
 */

import { createRailWheelset } from './createRailWheelset.js';
import {
	transportCount,
	transportPositive,
	transportVector3
} from '../common/transportValues.js';

export function createRailBogie(input = {}) {
	const id = String(input.id || 'bogie');
	const count = transportCount(input.wheelsetCount, 2, 1, 6);
	const spacing = transportPositive(input.wheelsetSpacing, 1.9, 'rail wheelset spacing');
	const position = transportVector3(input.position, [0, 0, 0], 'rail bogie position');
	const wheelsets = input.wheelsets?.length
		? input.wheelsets.map(createRailWheelset)
		: Array.from({ length: count }, (_, index) => {
			const longitudinal = (index - (count - 1) / 2) * spacing;
			return createRailWheelset({
				...input.wheelset,
				id: `${id}:wheelset:${index}`,
				position: [position[0], position[1] + longitudinal, position[2]],
				powered: input.powered
			});
		});
	return Object.freeze({
		schema: 'awtsmoos.rail-bogie',
		version: 1,
		id,
		position: Object.freeze(position),
		frameSize: Object.freeze(transportVector3(input.frameSize, [2.3, 2.8, 0.3], 'rail bogie frame size')),
		wheelsets: Object.freeze(wheelsets),
		suspension: Object.freeze({ ...(input.suspension || { type: 'secondary-spring' }) }),
		maxYawDegrees: Number(input.maxYawDegrees ?? 12),
		metadata: Object.freeze({ ...(input.metadata || {}) })
	});
}
