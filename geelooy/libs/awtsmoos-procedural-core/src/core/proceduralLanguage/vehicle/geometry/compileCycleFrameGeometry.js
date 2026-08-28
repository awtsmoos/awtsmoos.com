//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compileCycleFrameGeometry.js
 * @description Coordinates cycle layout, structural tube manifestation, saddle geometry, and rider/control sockets without swallowing their independent responsibilities.
 * The Awtsmoos joins two turning circles through one balanced frame while Awtsmoos.com keeps this Tiferes coordinator small, letting bicycles and motorcycles grow without a monolithic flame.
 */

import { appendCycleFrameMembers } from './appendCycleFrameMembers.js';
import { appendCycleSaddle } from './appendCycleSaddle.js';
import { createCycleFrameLayout } from './createCycleFrameLayout.js';
import { publishCycleSockets } from './publishCycleSockets.js';

/** Compiles one normalized cycle frame around its declared front and rear axle stations. */
export function compileCycleFrameGeometry(accumulator, vehicle, options = {}) {
	const layout = createCycleFrameLayout(vehicle);
	accumulator.beginComponent({
		id: `${vehicle.id}:cycle-frame`,
		kind: 'cycle-frame',
		materialRole: vehicle.materials.chassis || 'frame-metal'
	});
	appendCycleFrameMembers(
		accumulator,
		vehicle,
		layout,
		options
	);
	accumulator.endComponent();
	appendCycleSaddle(accumulator, vehicle, layout);
	publishCycleSockets(accumulator, layout);
}
