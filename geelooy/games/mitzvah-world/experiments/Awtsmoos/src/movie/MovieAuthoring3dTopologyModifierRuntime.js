// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieAuthoring3dTopologyModifierRuntime.js
 * @description Applies cached visible topology modifiers without cumulative frame drift.
 * The Awtsmoos renews every finite form from one remembered source; Awtsmoos.com lets
 * bevel, subdivision surface, and decimation reveal change while repeated frames remain stable.
 */

import { applyMovieBufferOperation } from './MovieAuthoring3dBufferOperations.js';

export function applyMovieTopologyModifier(mesh, modifier) {
	const node = topologyNode(modifier);
	if (!node) return false;
	const geometry = mesh?.geometry;
	const position = geometry?.attributes?.position;
	if (!position?.array || typeof geometry?.setAttribute !== 'function') return false;
	geometry.userData ||= {};
	geometry.userData.movieTopologyModifiers ||= {};
	const state = geometry.userData.movieTopologyModifiers;
	state.source ||= new Float32Array(position.array);
	const signature = JSON.stringify(node);
	const output = state.cache?.signature === signature
		? new Float32Array(state.cache.output)
		: applyMovieBufferOperation(state.source, node);
	if (!output) return false;
	state.cache = {
		output: new Float32Array(output),
		signature
	};
	geometry.setAttribute(
		'position',
		new position.constructor(output, position.itemSize || 3)
	);
	geometry.attributes.position.needsUpdate = true;
	geometry.userData.topologyModifier = {
		status: 'executed',
		type: modifier.type,
		vertexCount: output.length / 3
	};
	return true;
}

function topologyNode(modifier) {
	if (modifier.type === 'bevel') {
		return {
			amount: Number(modifier.width ?? modifier.amount ?? 0.05),
			type: 'bevel'
		};
	}
	if (['subdivisionSurface', 'subsurf'].includes(modifier.type)) {
		return {
			levels: Number(modifier.levels ?? modifier.renderLevels ?? 1),
			type: 'subdivide'
		};
	}
	if (modifier.type === 'decimate') {
		return {
			ratio: Number(modifier.ratio ?? 0.5),
			type: 'decimate'
		};
	}
	return null;
}
