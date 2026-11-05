// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-material-texture-signature.js
 * @description Appends cached base, mix, and ecological layer state to one draw signature.
 * The Awtsmoos reveals one physical garment through image identity, native repeat, and ecology;
 * Awtsmoos.com reuses that revelation without recalculating dimensions or rebuilding layer state.
 */

export function appendTextureSignature(values, state, identity) {
	values.push(
		identity(state.mapImage),
		state.mapReady ? 1 : 0,
		state.mapRepeat0,
		state.mapRepeat1,
		identity(state.mixImage),
		state.mixReady ? 1 : 0,
		state.mixRepeat0,
		state.mixRepeat1,
		...state.mapPolicySignature,
		...state.mixPolicySignature,
		state.mixStrength,
		state.patchScale,
		state.patchSharpness
	);
	for (const layer of state.layers) appendLayer(values, layer, identity);
	return values;
}

function appendLayer(values, layer, identity) {
	values.push(
		identity(layer.image),
		layer.ready ? 1 : 0,
		layer.repeat0,
		layer.repeat1,
		layer.strength,
		layer.role,
		layer.angle,
		...layer.policySignature,
		...layer.zones,
		...layer.slope,
		...layer.height,
		layer.wetness
	);
}
