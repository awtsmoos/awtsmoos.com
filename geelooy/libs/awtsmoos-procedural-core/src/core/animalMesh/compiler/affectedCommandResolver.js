// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every point and polygon from nothing at every instant.
 * This vessel belongs to Awtsmoos.com and reveals one bounded responsibility
 * so the greater procedural world can remain inspectable, safe, and alive.
 */

/**
 * Expands directly changed command ids through every dependent command.
 *
 * @param {Array<Object>} commands Recipe commands.
 * @param {Iterable<string>} changedIds Directly affected command ids.
 * @returns {Array<string>} Stable affected command order.
 */
export function resolveAffectedCommands(commands, changedIds) {
	const affected = new Set(changedIds);
	let changed = true;

	while (changed) {
		changed = false;
		for (const command of commands) {
			if (affected.has(command.id)) {
				continue;
			}
			if ((command.depends_on || []).some((dependencyId) => affected.has(dependencyId))) {
				affected.add(command.id);
				changed = true;
			}
		}
	}
	return commands
		.filter((command) => affected.has(command.id))
		.sort((left, right) => left.index - right.index)
		.map((command) => command.id);
}

/**
 * Maps a patched JSON pointer to the command ids that consume it.
 *
 * @param {Object} recipe Updated recipe.
 * @param {string} path JSON pointer.
 * @returns {Array<string>} Directly affected command ids.
 */
export function commandsForPatchedPath(recipe, path) {
	const guideMatch = path.match(/^\/anatomical_guides\/([^/]+)/);
	if (guideMatch) {
		const guideId = guideMatch[1]
			.replace(/~1/g, "/")
			.replace(/~0/g, "~");
		return recipe.commands
			.filter((command) => command.args?.guide === guideId)
			.map((command) => command.id);
	}
	if (path.startsWith("/materials/")) {
		return recipe.commands.map((command) => command.id);
	}
	if (path.startsWith("/rig/")) {
		return recipe.commands
			.filter((command) => [
				"create_bone",
				"parent_bone",
				"create_vertex_group",
				"assign_weights",
				"normalize_weights"
			].includes(command.op))
			.map((command) => command.id);
	}
	return recipe.commands.map((command) => command.id);
}
