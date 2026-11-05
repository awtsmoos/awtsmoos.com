// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-material-signature-state.js
 * @description Observes non-texture mesh facts that can alter exact draw compatibility.
 * The Awtsmoos joins equal garments without confusing color, culling, wind, or primitive mode;
 * Awtsmoos.com compares these finite values directly so stable signatures need no rebuilt arrays.
 */

import { materialModeCode } from './tiny-render-webgl-utils.js';

export function captureMaterialSignatureState(mesh, textureState) {
	const material = mesh.material || {};
	const color = material.color || [0.75, 0.70, 0.62, 1];
	const grass = mesh.userData?.AwtsmoosYardGrass || {};
	return {
		alphaCutoff: material.alphaCutoff ?? 0.5,
		alphaMode: material.alphaMode || 'OPAQUE',
		anisotropy: material.anisotropy ?? 2,
		color0: color[0] ?? 0.75,
		color1: color[1] ?? 0.70,
		color2: color[2] ?? 0.62,
		cullingDisabled: material.backfaceCull === false,
		doubleSided: material.doubleSided === true,
		emissiveStrength: material.emissiveStrength ?? 1.8,
		geometryMode: mesh.geometry?.mode ?? mesh.primitiveMode ?? 4,
		grassRadius: grass.interactionRadius ?? 2.2,
		grassReactive: grass.reactsToPlayer === true,
		grassWind: grass.windStrength ?? 0.085,
		material,
		materialMode: materialModeCode(mesh),
		opacity: material.opacity ?? color[3] ?? 1,
		textureState
	};
}

export function sameMaterialSignatureState(state, mesh, textureState) {
	if (!state) return false;
	const material = mesh.material || {};
	const color = material.color || [0.75, 0.70, 0.62, 1];
	const grass = mesh.userData?.AwtsmoosYardGrass || {};
	return state.material === material
		&& state.textureState === textureState
		&& state.color0 === (color[0] ?? 0.75)
		&& state.color1 === (color[1] ?? 0.70)
		&& state.color2 === (color[2] ?? 0.62)
		&& state.opacity === (material.opacity ?? color[3] ?? 1)
		&& state.alphaMode === (material.alphaMode || 'OPAQUE')
		&& state.alphaCutoff === (material.alphaCutoff ?? 0.5)
		&& state.doubleSided === (material.doubleSided === true)
		&& state.cullingDisabled === (material.backfaceCull === false)
		&& state.emissiveStrength === (material.emissiveStrength ?? 1.8)
		&& state.anisotropy === (material.anisotropy ?? 2)
		&& state.materialMode === materialModeCode(mesh)
		&& state.grassReactive === (grass.reactsToPlayer === true)
		&& state.grassRadius === (grass.interactionRadius ?? 2.2)
		&& state.grassWind === (grass.windStrength ?? 0.085)
		&& state.geometryMode === (mesh.geometry?.mode ?? mesh.primitiveMode ?? 4);
}
