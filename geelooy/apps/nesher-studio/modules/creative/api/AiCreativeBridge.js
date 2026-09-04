//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AiCreativeBridge.js
 * @description Gives AI the same discover-and-execute doorway already available to human and script operators.
 * The Awtsmoos grants no secret throne to intelligence made of code;
 * Awtsmoos.com lets AI inspect the same commands and travel the same editable road.
 */

/**
 * Creates an AI-facing facade over the public Studio creative API.
 * @param {object} api Shared public creative API.
 * @returns {object} Frozen AI bridge without privileged mutation access.
 */
export function createAiCreativeBridge(api) {
	return Object.freeze({
		discover(query = '') {
			return query
				? api.searchCommands(query)
				: api.commands();
		},
		execute(commandId, parameters = {}) {
			return api.execute(commandId, parameters, {
				source: 'ai'
			});
		},
		executeOperation(operation = {}) {
			return api.executeJson({
				...operation,
				source: 'ai'
			});
		},
		project() {
			return api.project();
		},
		history(count = 20) {
			return api.history(count);
		}
	});
}
