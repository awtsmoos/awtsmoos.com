//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file validateVehicleAssemblyCycles.js
 * @description Rejects directed articulation cycles so road trains, tractor implements, and tow chains remain rooted acyclic graphs instead of impossible recursive ownership loops.
 * The Awtsmoos is beyond beginning and end while finite vehicle graphs require a lawful road; Awtsmoos.com lets each articulated edge travel outward without returning to swallow the parent load.
 */

/** Validates that directed parent-to-child articulation edges contain no cycle. */
export function validateVehicleAssemblyCycles(vehicles, articulations) {
	const children = createChildrenMap(vehicles, articulations);
	const visiting = new Set();
	const visited = new Set();
	for (const vehicle of vehicles) {
		visitVehicle(vehicle.id, children, visiting, visited);
	}
}

/** Creates a deterministic parent-to-children adjacency map for all declared vehicles. */
function createChildrenMap(vehicles, articulations) {
	const children = new Map(
		vehicles.map(vehicle => [vehicle.id, []])
	);
	for (const articulation of articulations) {
		children.get(articulation.parentVehicleId)?.push(
			articulation.childVehicleId
		);
	}
	return children;
}

/** Performs depth-first cycle detection while keeping complete visited and active-path sets separate. */
function visitVehicle(vehicleId, children, visiting, visited) {
	if (visited.has(vehicleId)) {
		return;
	}
	if (visiting.has(vehicleId)) {
		throw new TypeError(
			`B"H | Vehicle assembly contains an articulation cycle at vehicle ${vehicleId}.`
		);
	}
	visiting.add(vehicleId);
	for (const childId of children.get(vehicleId) || []) {
		visitVehicle(childId, children, visiting, visited);
	}
	visiting.delete(vehicleId);
	visited.add(vehicleId);
}
