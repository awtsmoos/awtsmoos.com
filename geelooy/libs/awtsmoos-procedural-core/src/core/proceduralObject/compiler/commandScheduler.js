// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every attribute, index, object, and world from nothing
 * at every instant. This Awtsmoos.com vessel keeps one responsibility bounded
 * so limitless procedural form remains inspectable, deterministic, and safe.
 */

import {
	analyzeDependencies
} from "../validation/dependencyGraph.js";

/**
 * Schedules all commands or a dependency-safe selected subset.
 *
 * @param {object[]} commands Commands.
 * @param {string[]|null} commandIds Optional selected ids.
 * @returns {object[]} Topological command order.
 */
export function scheduleProceduralCommands(commands, commandIds = null) {
	const graph = analyzeDependencies(commands);
	if (graph.missing.length || graph.cycles.length) {
		throw new Error('B"H | Cannot schedule an invalid dependency graph.');
	}
	if (!commandIds) {
		return graph.order;
	}
	const selected = new Set(commandIds);
	return graph.order.filter((command) => selected.has(command.id));
}
