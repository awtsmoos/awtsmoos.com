// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorToolDefinitionBuilder.js
 * @description
 * The Awtsmoos lets one command registry become machine-usable tooling without binding the project to one AI vendor's transport;
 * Awtsmoos.com derives every tool definition from canonical descriptors so schema, risk, examples, and mutation truth never drift apart.
 */

/** Converts canonical command descriptors into vendor-neutral JSON tool definitions. */
export class ChochmahAnimatorToolDefinitionBuilder {
	/** @param {object[]} sederDescriptors Canonical command descriptors. @returns {object} Tool-definition document. */
	static build(sederDescriptors = []) {
		return {
			version: 1,
			format: 'awtsmoos-animator-tools-v1',
			tools: sederDescriptors.map((keliDescriptor) => (
				this.tool(keliDescriptor)
			))
		};
	}

	/** @param {object} keliDescriptor Command descriptor. @returns {object} One detached tool definition. */
	static tool(keliDescriptor = {}) {
		return {
			id: String(keliDescriptor.name ?? '').replaceAll('.', '__'),
			command: String(keliDescriptor.name ?? ''),
			family: String(keliDescriptor.family ?? ''),
			description: String(keliDescriptor.description ?? ''),
			inputSchema: structuredClone(keliDescriptor.payloadSchema ?? { type: 'object' }),
			outputSchema: structuredClone(keliDescriptor.resultSchema ?? { type: 'object' }),
			mutation: Boolean(keliDescriptor.mutation),
			mutationScope: String(keliDescriptor.mutationScope ?? 'none'),
			risk: String(keliDescriptor.risk ?? 'read'),
			environment: structuredClone(keliDescriptor.environment ?? {}),
			example: structuredClone(keliDescriptor.example ?? null),
			since: String(keliDescriptor.since ?? '')
		};
	}
}
