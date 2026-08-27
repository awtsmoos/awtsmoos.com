// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DomemModifierPipeline.js
 * @description Runs strict data-driven geometry modifier chains while recording topology evidence after every transformation.
 * The Awtsmoos, Atzmus beyond every sequential cause, renews the final form in every instant beyond the chain;
 * Awtsmoos.com nevertheless reveals each finite step so procedural geometry can be inspected, replayed, serialized, and explained plain.
 */

import { applySingleModifier } from '../geometry/modifiers/router.js';
import { mirrorDomemMesh } from './DomemMirrorModifier.js';
import { createDomemMesh } from './DomemMesh.js';
import { domemMeshStats } from './DomemMeshStats.js';
import { validateDomemModifier } from './DomemModifierCatalog.js';

/**
 * Applies one strict modifier to a fresh editable mesh.
 * @param {object} source Source geometry.
 * @param {object} modifier `{type, params}` descriptor.
 * @param {object} [objectData={}] Legacy modifier context and export target.
 * @returns {object} New structured mesh.
 */
export function applyDomemModifier(source, modifier, objectData = {}) {
	const validated = validateDomemModifier(modifier);
	const mesh = createDomemMesh(source);
	if (validated.type === 'mirror') {
		return mirrorDomemMesh(mesh, validated.params || {});
	}
	return applySingleModifier(mesh, validated, objectData) || mesh;
}

/**
 * Applies an ordered immutable-by-default modifier pipeline and records topology deltas.
 * @param {object} source Source geometry.
 * @param {Array<object>} [modifiers=[]] Ordered modifier descriptors.
 * @param {object} [objectData={}] Legacy context shared through registry handlers.
 * @returns {{mesh:object,steps:Array<object>,exportedPoints:object}} Frozen pipeline evidence.
 */
export function runDomemModifierPipeline(source, modifiers = [], objectData = {}) {
	if (!Array.isArray(modifiers)) {
		throw new TypeError('B"H | Domem modifier pipeline must be an array.');
	}
	const context = {
		...objectData,
		exportedPoints: { ...(objectData.exportedPoints || {}) }
	};
	let mesh = createDomemMesh(source);
	const steps = [];
	for (const [index, modifier] of modifiers.entries()) {
		const before = domemMeshStats(mesh);
		mesh = applyDomemModifier(mesh, modifier, context);
		const after = domemMeshStats(mesh);
		steps.push(Object.freeze({
			after,
			before,
			faceDelta: after.faces - before.faces,
			index,
			type: modifier.type,
			vertexDelta: after.uniquePositions - before.uniquePositions
		}));
	}
	return Object.freeze({
		exportedPoints: Object.freeze({ ...context.exportedPoints }),
		mesh,
		steps: Object.freeze(steps)
	});
}
