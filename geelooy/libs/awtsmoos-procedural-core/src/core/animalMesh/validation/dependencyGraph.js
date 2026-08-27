// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every point and polygon from nothing at every instant.
 * This vessel belongs to Awtsmoos.com and reveals one bounded responsibility
 * so the greater procedural world can remain inspectable, safe, and alive.
 */

/**
 * Builds deterministic command dependency order and cycle diagnostics.
 *
 * @param {Array<Object>} commands Recipe commands.
 * @returns {{order:Array<Object>, missing:Array<Object>, cycles:Array<string>}}
 * Dependency analysis.
 */
export function analyzeCommandDependencies(commands) {
	const commandById = new Map(commands.map((command) => [
		command.id,
		command
	]));
	const missing = [];
	const indegree = new Map();
	const dependents = new Map();

	for (const command of commands) {
		indegree.set(command.id, 0);
		dependents.set(command.id, []);
	}
	for (const command of commands) {
		for (const dependencyId of command.depends_on || []) {
			if (!commandById.has(dependencyId)) {
				missing.push({
					commandId: command.id,
					dependencyId
				});
				continue;
			}
			indegree.set(command.id, indegree.get(command.id) + 1);
			dependents.get(dependencyId).push(command.id);
		}
	}
	const queue = commands
		.filter((command) => indegree.get(command.id) === 0)
		.sort(compareCommands);
	const order = [];

	while (queue.length > 0) {
		const command = queue.shift();
		order.push(command);
		for (const dependentId of dependents.get(command.id)) {
			indegree.set(dependentId, indegree.get(dependentId) - 1);
			if (indegree.get(dependentId) === 0) {
				queue.push(commandById.get(dependentId));
				queue.sort(compareCommands);
			}
		}
	}
	const cycles = commands
		.filter((command) => !order.includes(command))
		.map((command) => command.id);

	return {
		order,
		missing,
		cycles
	};
}

function compareCommands(left, right) {
	return (left.index - right.index) || left.id.localeCompare(right.id);
}
