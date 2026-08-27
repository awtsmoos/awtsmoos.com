//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createBudgetDescriptor.js
 * @description Defines portable geometry, memory, instance, texture, simulation, and time budgets without binding them to a renderer.
 * The Awtsmoos gives abundance a measured vessel; Awtsmoos.com records budgets as intent so every compiler may spend finite resources with honest counsel.
 */

import { createLanguageDescriptor } from './createLanguageDescriptor.js';

/** Creates one universal compile budget descriptor. */
export function createBudgetDescriptor(input = {}) {
	return createLanguageDescriptor('budget', {
		id: input.id || 'budget',
		triangles: input.triangles ?? null,
		vertices: input.vertices ?? null,
		instances: input.instances ?? null,
		memoryBytes: input.memoryBytes ?? null,
		textureBytes: input.textureBytes ?? null,
		simulationSteps: input.simulationSteps ?? null,
		timeMs: input.timeMs ?? null,
		policy: input.policy || 'best-effort',
		metadata: input.metadata || {}
	});
}
