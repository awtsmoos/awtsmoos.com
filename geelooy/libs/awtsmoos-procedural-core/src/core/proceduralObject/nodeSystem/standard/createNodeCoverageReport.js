// B"H
// Boruch Hashem
// Blessed is He
/** Coverage reports distinguish implemented contracts from preserved opaque nodes. */

export function createNodeCoverageReport(input) {
	const definitions = input.definitionRegistry.list();
	const supported = definitions
		.filter((definition) => input.executorRegistry.has(definition.type, "1.0.0"))
		.map((definition) => definition.type);
	const unsupported = definitions
		.filter((definition) => !input.executorRegistry.has(definition.type, "1.0.0"))
		.map((definition) => definition.type);
	return Object.freeze({
		schema: "awtsmoos.node-coverage-report",
		definitionCount: definitions.length,
		executableCount: supported.length,
		supported: Object.freeze(supported),
		unsupported: Object.freeze(unsupported),
		complete: unsupported.length === 0,
		rendererNeutral: true
	});
}
