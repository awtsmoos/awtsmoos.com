// B"H
// Boruch Hashem
// Blessed is He
/** Coverage names representation, local execution, native semantics, and fallback. */

/** Creates an honest manifest-level Blender node coverage report in O(nodes). */
export function createBlenderNodeCoverageReport(pack) {
	const definitions = pack.nodeSchemaPack.definitions;
	const byTree = {};
	for (const definition of definitions) {
		const treeType = definition.metadata.treeType ?? "unknown";
		const entry = byTree[treeType] ??= {
			represented: 0,
			locallyExecutable: 0,
			independentNativeSemantics: 0
		};
		entry.represented += 1;
		entry.locallyExecutable += Number(
			definition.metadata.metadata?.implementation === "local"
		);
		entry.independentNativeSemantics += Number(
			definition.metadata.metadata?.nativeSemantics === true
		);
	}
	return Object.freeze({
		blenderVersion: pack.manifest.blenderVersion,
		manifestHash: pack.manifest.contentHash,
		representedNodeCount: definitions.length,
		treeTypes: Object.freeze(Object.fromEntries(
			Object.entries(byTree).map(([name, value]) => [name, Object.freeze(value)])
		)),
		opaqueFallback: true,
		connectionModel: "typed-sockets-with-field-lifting-and-multi-input-order",
		zonesRepresented: Object.freeze(pack.zones.map(zone => zone.id)),
		notClaimed: Object.freeze([
			"Blender user-interface parity",
			"Blender operator parity",
			"bundled trusted Blender worker",
			"numerical parity for adapter-dependent nodes"
		])
	});
}
