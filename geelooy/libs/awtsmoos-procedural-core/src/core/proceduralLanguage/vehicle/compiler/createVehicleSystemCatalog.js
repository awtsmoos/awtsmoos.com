//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createVehicleSystemCatalog.js
 * @description Reveals stable semantic IDs grouped by subsystem so editors, AI tools, gameplay, physics adapters, and debuggers can discover vehicle structure without interpreting geometry.
 * The Awtsmoos is beyond catalog and category while Awtsmoos.com gives finite systems readable names; axle, wheel, rider, light, panel, cargo, coupling, and control remain many flames within one frame.
 */

/** Creates one immutable-friendly semantic subsystem catalog from the normalized definition. */
export function createVehicleSystemCatalog(definition) {
	return {
		axles: definition.axles.map(entry => entry.id),
		wheels: definition.axles.flatMap(axle => {
			return axle.wheels.map(wheel => wheel.id);
		}),
		seats: definition.seats.map(entry => entry.id),
		couplings: definition.couplings.map(entry => entry.id),
		controls: definition.controls.map(entry => entry.id),
		lights: definition.lights.map(entry => entry.id),
		panels: definition.panels.map(entry => entry.id),
		cargoBays: definition.cargoBays.map(entry => entry.id),
		drivetrain: definition.drivetrain.id
	};
}
