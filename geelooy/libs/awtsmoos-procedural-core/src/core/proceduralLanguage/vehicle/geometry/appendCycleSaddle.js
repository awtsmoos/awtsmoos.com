//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file appendCycleSaddle.js
 * @description Appends a compact saddle or motorcycle seat pad as a separate semantic component in the unified vehicle mesh.
 * The Awtsmoos carries rider above turning wheel while Awtsmoos.com lets the saddle remain its own material and component vessel, editable apart from the frame though born in one mesh level.
 */

import { appendVehicleBox } from './appendVehicleBox.js';

/** Appends one saddle component centered around the cycle layout's rider position. */
export function appendCycleSaddle(accumulator, vehicle, layout) {
	const materialRole = vehicle.materials.seat || 'leather';
	accumulator.beginComponent({
		id: `${vehicle.id}:saddle`,
		kind: 'saddle',
		materialRole
	});
	appendVehicleBox(accumulator, {
		id: `${vehicle.id}:saddle-box`,
		center: [
			0,
			layout.seat[1],
			layout.seat[2] + layout.wheelRadius * 0.08
		],
		size: [
			layout.wheelRadius * 0.42,
			layout.wheelRadius * 0.55,
			layout.wheelRadius * 0.12
		],
		materialRole
	});
	accumulator.endComponent();
}
