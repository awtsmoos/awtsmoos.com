// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every attribute, index, object, and world from nothing
 * at every instant. This Awtsmoos.com vessel keeps one responsibility bounded
 * so limitless procedural form remains inspectable, deterministic, and safe.
 */

/**
 * Analyzes command dependencies and returns deterministic topological order.
 *
 * @param {object[]} commands Commands.
 * @returns {object} Ordered commands, missing references, and cycles.
 */
export function analyzeDependencies(commands = []) {
	const byId = new Map(commands.map((command) => [command.id, command]));
	const missing = [];
	const visiting = new Set();
	const visited = new Set();
	const order = [];
	const cycles = [];

	function visit(command, path = []) {
		if (visited.has(command.id)) {
			return;
		}
		if (visiting.has(command.id)) {
			cycles.push([...path, command.id]);
			return;
		}
		visiting.add(command.id);
		for (const dependencyId of command.depends_on || []) {
			const dependency = byId.get(dependencyId);
			if (!dependency) {
				missing.push({
					command: command.id,
					dependency: dependencyId
				});
				continue;
			}
			visit(dependency, [...path, command.id]);
		}
		visiting.delete(command.id);
		visited.add(command.id);
		order.push(command);
	}
	for (const command of commands) {
		visit(command);
	}
	return {
		order,
		missing,
		cycles
	};
}
