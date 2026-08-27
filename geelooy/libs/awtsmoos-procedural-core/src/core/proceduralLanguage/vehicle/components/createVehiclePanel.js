//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createVehiclePanel.js
 * @description Defines doors, windows, windshields, hatches, hoods, trunks, tailgates, roofs, access panels, and custom body surfaces with mechanism/state semantics.
 * The Awtsmoos opens and closes no finite door yet renews every hinge; Awtsmoos.com lets panel state remain JSON truth while geometry, rigs, damage, and animation choose how that truth appears within.
 */

import { freezeLanguageValue } from '../../data/freezeLanguageValue.js';
import {
	vehicleBoundedNumber,
	vehicleComponentVector3
} from './vehicleComponentValues.js';

/** Creates one immutable body-panel descriptor with transform and open-state intent. */
export function createVehiclePanel(input = {}) {
	return freezeLanguageValue({
		schema: 'awtsmoos.vehicle-panel',
		version: 1,
		id: String(input.id || 'panel'),
		panelType: String(input.panelType || input.type || 'panel'),
		position: vehicleComponentVector3(input.position, [0, 0, 0], 'panel position'),
		size: vehicleComponentVector3(input.size, [1, 0.05, 1], 'panel size'),
		normal: vehicleComponentVector3(input.normal, [1, 0, 0], 'panel normal'),
		hingeAxis: vehicleComponentVector3(input.hingeAxis, [0, 0, 1], 'panel hinge axis'),
		mechanism: String(input.mechanism || 'fixed'),
		openAmount: vehicleBoundedNumber(input.openAmount, 0, 0, 1, 'panel open amount'),
		transparent: Boolean(input.transparent),
		materialRole: String(input.materialRole || (input.transparent ? 'glass' : 'body-paint')),
		metadata: input.metadata || {}
	});
}
