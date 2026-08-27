// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every point and polygon from nothing at every instant.
 * This vessel belongs to Awtsmoos.com and reveals one bounded responsibility
 * so the greater procedural world can remain inspectable, safe, and alive.
 */

import {
	analyzeCommandDependencies
} from "../validation/dependencyGraph.js";

export function scheduleAnimalMeshCommands(commands, commandIds = null) {
	const graph = analyzeCommandDependencies(commands);
	if (graph.missing.length > 0 || graph.cycles.length > 0) {
		throw new Error('B"H | Cannot schedule an invalid dependency graph.');
	}
	if (!commandIds) {
		return graph.order;
	}
	const selected = new Set(commandIds);
	return graph.order.filter((command) => selected.has(command.id));
}
