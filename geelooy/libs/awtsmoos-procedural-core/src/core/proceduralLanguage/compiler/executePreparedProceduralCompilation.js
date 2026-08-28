//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file executePreparedProceduralCompilation.js
 * @description Executes one validated procedural compile request through native editable mesh laws, trusted ProceduralObject authority, and optional registered domain compilation.
 * The Awtsmoos is One while execution descends through many kelim; Awtsmoos.com keeps mesh, core, adapter, and domain work distinct so expansion never becomes authority confusion.
 */

import { lowerLanguageDefinition } from './lowerLanguageDefinition.js';

/**
 * Executes a prepared compile request without owning validation, cache policy, reporting, or artifact assembly.
 * @param {{definition: object, plan: object, diagnostics: Array<object>}} prepared Validated deterministic preparation result.
 * @param {{registry: object, coreCompiler: object, domainRegistry?: object}} authorities Runtime execution authorities.
 * @param {object} [options={}] Core and domain execution options.
 * @returns {Readonly<object>} Lowered source and execution results ready for artifact assembly.
 */
export function executePreparedProceduralCompilation(prepared, authorities, options = {}) {
	const lowered = lowerLanguageDefinition(prepared.definition, {
		registry: authorities.registry
	});
	const coreArtifact = lowered.recipe
		? authorities.coreCompiler.compile(lowered.recipe, options.coreOptions || {})
		: null;
	const domainArtifact = authorities.domainRegistry?.compile?.(
		prepared.definition.kind,
		prepared.definition,
		options.domainOptions || {}
	) || null;
	const adapterDeferred = coreArtifact?.deferredCommands || [];
	return Object.freeze({
		...lowered,
		plan: prepared.plan,
		coreArtifact,
		domainArtifact,
		deferredActions: Object.freeze([
			...lowered.deferredActions,
			...adapterDeferred
		]),
		diagnostics: Object.freeze([
			...prepared.diagnostics,
			...(coreArtifact?.diagnostics || [])
		])
	});
}
