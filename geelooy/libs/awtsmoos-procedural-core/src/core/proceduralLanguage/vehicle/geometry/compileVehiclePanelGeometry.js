//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compileVehiclePanelGeometry.js
 * @description Optionally manifests declared doors, windows, windshields, hatches, roofs, hoods, trunks, and custom panels as oriented semantic mesh ranges.
 * The Awtsmoos renews every hinge yet is not bounded by open or closed; Awtsmoos.com lets panel declarations become editable polygons while animation adapters may still interpret mechanism and openAmount through their own unfolding.
 */

import { appendVehiclePanelPrism } from './appendVehiclePanelPrism.js';

/** Appends every configured panel at its declared base pose without consuming runtime hinge state. */
export function compileVehiclePanelGeometry(accumulator, vehicle) {
	for (const panel of vehicle.panels) {
		accumulator.beginComponent({
			id: `${vehicle.id}:panel:${panel.id}`,
			kind: `panel-${panel.panelType}`,
			materialRole: panel.materialRole,
			metadata: {
				transparent: panel.transparent,
				mechanism: panel.mechanism
			}
		});
		appendVehiclePanelPrism(accumulator, {
			id: `${vehicle.id}:panel-body:${panel.id}`,
			position: panel.position,
			size: panel.size,
			normal: panel.normal,
			materialRole: panel.materialRole
		});
		accumulator.endComponent();
	}
}
