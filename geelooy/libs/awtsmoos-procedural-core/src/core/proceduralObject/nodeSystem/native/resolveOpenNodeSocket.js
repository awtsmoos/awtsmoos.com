// B"H
// Boruch Hashem
// Blessed is He
/** Socket resolution keeps connection planning independent from editors. */

function socketList(definition, direction) {
	return direction === "output" ? definition.outputs : definition.inputs;
}

/**
 * Resolves one node definition and socket from the merged registry.
 * @param {Object} registry - NodeDefinitionRegistry-compatible registry.
 * @param {Object} reference - Node type, socket ID, and direction.
 * @returns {Object} Frozen definition/socket evidence.
 */
export function resolveOpenNodeSocket(registry, reference) {
	const definition = registry.resolve(reference?.nodeType);
	if (!definition) {
		throw new Error(`Unknown open node type: ${reference?.nodeType}`);
	}
	const direction = reference?.direction === "output" ? "output" : "input";
	const socket = socketList(definition, direction).find(
		(candidate) => candidate.id === reference?.socketId
	);
	if (!socket) {
		throw new Error(
			`Unknown ${direction} socket ${reference?.socketId} on ${definition.type}`
		);
	}
	return Object.freeze({ definition, socket, direction });
}
