// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every point and polygon from nothing at every instant.
 * This vessel belongs to Awtsmoos.com and reveals one bounded responsibility
 * so the greater procedural world can remain inspectable, safe, and alive.
 */

import {
	ANIMAL_MESH_LIMITS,
	ANIMAL_MESH_OPERATIONS
} from "../constants/animalMeshContract.js";
import {
	analyzeCommandDependencies
} from "./dependencyGraph.js";
import {
	collectUnsafeArgumentIssues
} from "./securityRules.js";

export function validateRecipeCommands(commands, result) {
	if (!Array.isArray(commands) || commands.length > ANIMAL_MESH_LIMITS.maximumCommands) {
		result.addError(
			"/commands",
			"command_count",
			"Command list is missing or too large."
		);
		return;
	}
	const ids = new Set();
	commands.forEach((command, index) => {
		validateCommand(command, index, ids, result);
	});
	const graph = analyzeCommandDependencies(commands);
	for (const item of graph.missing) {
		result.addError(
			`/commands/${item.commandId}/depends_on`,
			"missing_dependency",
			`Missing command dependency: ${item.dependencyId}`
		);
	}
	if (graph.cycles.length > 0) {
		result.addError(
			"/commands",
			"dependency_cycle",
			graph.cycles.join(", ")
		);
	}
}

function validateCommand(command, index, ids, result) {
	if (!ANIMAL_MESH_OPERATIONS.includes(command?.op)) {
		result.addError(
			`/commands/${index}/op`,
			"operation",
			"Operation is not whitelisted."
		);
	}
	if (!command?.id || ids.has(command.id)) {
		result.addError(
			`/commands/${index}/id`,
			"command_id",
			"Command id is missing or duplicated."
		);
	}
	ids.add(command?.id);
	if (!Array.isArray(command?.depends_on)) {
		result.addError(
			`/commands/${index}/depends_on`,
			"dependencies",
			"depends_on must be an array."
		);
	}
	for (const issue of collectUnsafeArgumentIssues(
		command?.args || {},
		`/commands/${index}/args`
	)) {
		result.addError(issue.path, "unsafe_argument", issue.message);
	}
}
