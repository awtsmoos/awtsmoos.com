// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every attribute, index, object, and world from nothing
 * at every instant. This Awtsmoos.com vessel keeps one responsibility bounded
 * so limitless procedural form remains inspectable, deterministic, and safe.
 */

/**
 * Expands changed command ids through every dependent command.
 *
 * @param {object[]} commands Commands.
 * @param {Iterable<string>} changedIds Direct changes.
 * @returns {string[]} Stable affected command ids.
 */
export function resolveAffectedCommands(commands, changedIds) {
	const affected = new Set(changedIds);
	let changed = true;
	while (changed) {
		changed = false;
		for (const command of commands) {
			if (
				!affected.has(command.id)
				&& (command.depends_on || []).some((id) => affected.has(id))
			) {
				affected.add(command.id);
				changed = true;
			}
		}
	}
	return commands
		.filter((command) => affected.has(command.id))
		.map((command) => command.id);
}

/**
 * Maps a recipe JSON pointer to direct command consumers.
 *
 * @param {object} recipe Recipe.
 * @param {string} path JSON pointer.
 * @returns {string[]} Directly affected ids.
 */
export function commandsForPatchedPath(recipe, path) {
	const commandMatch = path.match(/^\/commands\/(\d+)/);
	if (commandMatch) {
		const command = recipe.commands[Number(commandMatch[1])];
		return command ? [command.id] : [];
	}
	const definitionMatch = path.match(/^\/definitions\/([^/]+)/);
	if (definitionMatch) {
		const definitionId = definitionMatch[1]
			.replace(/~1/g, "/")
			.replace(/~0/g, "~");
		return recipe.commands
			.filter((command) => (
				command.args?.definition === definitionId
				|| command.args?.source_definition === definitionId
			))
			.map((command) => command.id);
	}
	return recipe.commands.map((command) => command.id);
}
