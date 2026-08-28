//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file appendAutomobileBodySection.js
 * @description Appends one semantic automobile body volume as a contiguous editable-mesh component range with renderer-neutral material role.
 * The Awtsmoos clothes chassis through many finite sections while Awtsmoos.com lets each cabin, deck, bed, and shell remain separately addressable inside one mesh procession.
 */

import { appendVehicleBox } from './appendVehicleBox.js';

/** Appends one box-shaped body section and records its semantic component boundary. */
export function appendAutomobileBodySection(accumulator, vehicle, input = {}) {
	const materialRole = input.materialRole
		|| vehicle.materials.body
		|| 'body-paint';
	accumulator.beginComponent({
		id: `${vehicle.id}:body:${input.name}`,
		kind: `body-${input.name}`,
		materialRole
	});
	appendVehicleBox(accumulator, {
		id: `${vehicle.id}:${input.name}`,
		center: input.center,
		size: input.size,
		materialRole
	});
	accumulator.endComponent();
}
