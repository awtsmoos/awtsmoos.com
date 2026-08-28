//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createProceduralCompilePlan.js
 * @description Dry-runs a procedural definition into explicit native, core-bridge, adapter, and descriptor execution steps before expensive work begins.
 * The Awtsmoos knows every consequence before action reaches form; Awtsmoos.com exposes the plan so budgets, adapters, and deferred intent can be understood before the storm.
 */

import { stableLanguageHash } from '../data/stableLanguageValue.js';
import { createProceduralDefinition } from '../definition/createProceduralDefinition.js';
import { createDefaultLanguageRegistry } from '../registry/createDefaultLanguageRegistry.js';
import { classifyLanguageOperation } from './classifyLanguageOperation.js';

/** Creates one JSON-safe deterministic compile plan without executing operations. */
export function createProceduralCompilePlan(input, options = {}) {
	const definition = createProceduralDefinition(input);
	const registry = options.registry || createDefaultLanguageRegistry();
	const steps = definition.actions
		.filter(action => action.enabled !== false)
		.map((action, index) => Object.freeze({ index, ...classifyLanguageOperation(action, registry) }));
	const counts = steps.reduce((result, step) => {
		result[step.execution] = (result[step.execution] || 0) + 1;
		return result;
	}, {});
	return Object.freeze({
		schema: 'awtsmoos.procedural-compile-plan',
		version: 1,
		definitionId: definition.id,
		definitionHash: stableLanguageHash(definition),
		steps: Object.freeze(steps),
		counts: Object.freeze(counts),
		canCompileWithoutAdapter: steps.every(step => step.execution !== 'adapter'),
		requiresAdapter: steps.some(step => step.execution === 'adapter')
	});
}
