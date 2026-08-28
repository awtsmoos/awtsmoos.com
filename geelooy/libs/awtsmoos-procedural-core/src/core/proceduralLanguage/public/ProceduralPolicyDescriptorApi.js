//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProceduralPolicyDescriptorApi.js
 * @description Collects budget, LOD, compile, state, stream, semantic material, editor, debug, and deterministic seed policies behind one focused authoring surface.
 * The Awtsmoos gives infinite possibility a finite vessel of measure while Awtsmoos.com keeps identity, quality, runtime state, material, editor, and debug intent outside hidden renderer weather;
 * one JSON covenant lets these policies guide creature, tree, mesh, building, and world together.
 */

import { createDebugArtifactDescriptor } from '../debug/createDebugArtifactDescriptor.js';
import { createBudgetDescriptor } from '../descriptor/createBudgetDescriptor.js';
import { createCompilePolicyDescriptor } from '../descriptor/createCompilePolicyDescriptor.js';
import { createEditorParameterDescriptor } from '../descriptor/createEditorParameterDescriptor.js';
import { createLodDescriptor } from '../descriptor/createLodDescriptor.js';
import { createMaterialRoleDescriptor } from '../descriptor/createMaterialRoleDescriptor.js';
import { createStateDescriptor } from '../descriptor/createStateDescriptor.js';
import { createStreamDescriptor } from '../descriptor/createStreamDescriptor.js';
import { ProceduralSeedNamespace } from '../seed/ProceduralSeedNamespace.js';

/** Authoring facade for quality, identity, runtime state, material, editor, and debug policies. */
export class ProceduralPolicyDescriptorApi {
	/** Creates renderer-neutral geometry, memory, instance, simulation, and timing budget intent. */
	budget(input = {}) {
		return createBudgetDescriptor(input);
	}

	/** Creates identity-preserving named level-of-detail intent. */
	lod(input = {}) {
		return createLodDescriptor(input);
	}

	/** Creates lazy channel, quality, validation, cache, adapter, trace, and failure compile policy. */
	compile(input = {}) {
		return createCompilePolicyDescriptor(input);
	}

	/** Creates transient pose, lifecycle, season, expression, damage, and environment state. */
	state(input = {}) {
		return createStateDescriptor(input);
	}

	/** Creates deterministic spatial streaming and chunk-budget intent for large worlds or object sets. */
	stream(input = {}) {
		return createStreamDescriptor(input);
	}

	/** Creates a semantic material role separated from renderer-specific material implementation. */
	materialRole(input = {}) {
		return createMaterialRoleDescriptor(input);
	}

	/** Creates editor labels, units, ranges, categories, choices, and descriptions. */
	parameter(input = {}) {
		return createEditorParameterDescriptor(input);
	}

	/** Creates optional renderer-neutral debug overlays such as frames, normals, bounds, or selections. */
	debug(input = {}) {
		return createDebugArtifactDescriptor(input);
	}

	/** Creates a stable named seed namespace whose children do not consume sibling randomness. */
	seed(seed = 'awtsmoos', path = []) {
		return new ProceduralSeedNamespace(seed, path);
	}
}
