//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file vehicleAssemblyValidation.js
 * @description Validates unique vehicle/articulation identity and proves every articulation references real vehicles and compatible coupling IDs before assembly compilation.
 * The Awtsmoos joins many vessels without confusing their names; Awtsmoos.com lets graph edges become trustworthy only after both endpoints and coupling sockets are revealed in finite frames.
 */

/** Rejects duplicate IDs in one assembly collection. */
export function assertUniqueAssemblyIds(entries, label) {
	const seen = new Set();
	for (const entry of entries) {
		if (seen.has(entry.id)) {
			throw new TypeError(`B"H | Duplicate ${label} id: ${entry.id}`);
		}
		seen.add(entry.id);
	}
}

/** Validates articulation vehicle and coupling references against normalized assembly vehicles. */
export function validateAssemblyArticulations(vehicles, articulations) {
	const vehiclesById = new Map(
		vehicles.map(vehicle => [vehicle.id, vehicle])
	);
	for (const articulation of articulations) {
		const parent = vehiclesById.get(articulation.parentVehicleId);
		const child = vehiclesById.get(articulation.childVehicleId);
		if (!parent || !child) {
			throw new TypeError(`B"H | Articulation ${articulation.id} references an unknown vehicle.`);
		}
		assertCouplingExists(parent, articulation.parentCouplingId, articulation.id);
		assertCouplingExists(child, articulation.childCouplingId, articulation.id);
	}
}

/** Rejects articulation endpoints whose named coupling socket is absent from the normalized vehicle. */
function assertCouplingExists(vehicle, couplingId, articulationId) {
	const found = vehicle.couplings.some(coupling => coupling.id === couplingId);
	if (!found) {
		throw new TypeError(
			`B"H | Articulation ${articulationId} requires coupling ${couplingId} on vehicle ${vehicle.id}.`
		);
	}
}
