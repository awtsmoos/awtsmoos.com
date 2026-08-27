// B"H
// Boruch Hashem
// Blessed is He
/** Zone validation binds simulation, repeat, and for-each boundaries explicitly. */

const EXPECTED = Object.freeze({
	simulation: ["simulation-input", "simulation-output"],
	repeat: ["repeat-input", "repeat-output"],
	foreach: ["foreach-input", "foreach-output"]
});

function diagnostic(code, message, metadata) {
	return Object.freeze({ code, message, metadata: Object.freeze(metadata) });
}

/**
 * Validates paired Blender-style zones in O(zones + nodes).
 * @returns {Object} Immutable validity, diagnostics, and claimed boundary IDs.
 * @deterministic Always for equal node tree and definition map.
 * @sideEffects None.
 */
export function validateBlenderNodeZones(tree, definitions = new Map()) {
	const nodes = new Map(tree.nodes.map(node => [node.id, node]));
	const claimed = new Set();
	const diagnostics = [];
	for (const zone of tree.zones ?? []) {
		const expected = EXPECTED[zone.type];
		if (!expected) {
			diagnostics.push(diagnostic(
				"BLENDER.NODE_ZONE_TYPE_UNKNOWN",
				"Zone type is not a recognized Blender semantic zone.",
				{ zoneId: zone.id, type: zone.type }
			));
			continue;
		}
		const boundaries = [zone.inputNodeId, zone.outputNodeId];
		for (let index = 0; index < boundaries.length; index += 1) {
			const nodeId = boundaries[index];
			const node = nodes.get(nodeId);
			const definition = node ? definitions.get(node.type) : null;
			const role = definition?.metadata?.zoneRole
				?? node?.metadata?.zoneRole
				?? null;
			if (!node || role !== expected[index]) {
				diagnostics.push(diagnostic(
					"BLENDER.NODE_ZONE_BOUNDARY_INVALID",
					"Zone boundary is missing or has the wrong semantic role.",
					{ zoneId: zone.id, nodeId, expectedRole: expected[index], actualRole: role }
				));
			}
			if (nodeId && claimed.has(nodeId)) {
				diagnostics.push(diagnostic(
					"BLENDER.NODE_ZONE_BOUNDARY_REUSED",
					"A zone boundary node may belong to only one zone.",
					{ zoneId: zone.id, nodeId }
				));
			}
			if (nodeId) claimed.add(nodeId);
		}
		if (zone.type === "repeat" && Number(zone.iterations) < 0) {
			diagnostics.push(diagnostic(
				"BLENDER.NODE_ZONE_ITERATIONS_INVALID",
				"Repeat-zone iterations must be non-negative.",
				{ zoneId: zone.id, iterations: zone.iterations }
			));
		}
	}
	return Object.freeze({
		ok: diagnostics.length === 0,
		diagnostics: Object.freeze(diagnostics),
		claimedBoundaryNodeIds: Object.freeze([...claimed].sort())
	});
}
