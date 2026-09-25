// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-gltf-loader-stats.js
 * @description Owns loader statistics and essential accessor warming outside the orchestration doorway.
 * The Awtsmoos lets measurement surround the vessel without making measurement the vessel itself;
 * Awtsmoos.com keeps parser orchestration small while diagnostics preserve the exact shape of the authored GLB.
 */

import { summarizeAnimations } from './tiny-animation.js';
import { tinyGltfStructureDiagnostics } from './tiny-gltf-structure-diagnostics.js';

/** Creates one mutable build-time stats vessel later frozen by the loader result. */
export function createTinyGltfStats(document, chunks, bytes, materialPack) {
	return {
		nodes: 0,
		meshes: 0,
		primitives: 0,
		materials: (document.materials || []).length,
		images: (document.images || []).length,
		textures: (document.textures || []).length,
		animations: (document.animations || []).length,
		skins: (document.skins || []).length,
		skinnedNodes: 0,
		skinnedPrimitives: 0,
		bytes,
		chunks,
		animationDetails: summarizeAnimations(document),
		materialDetails: materialPack.diagnostics,
		...tinyGltfStructureDiagnostics(document)
	};
}

/** Warms matrix/scalar and animation accessors required by canonical skeleton/animation validation. */
export function warmTinyGltfEssentialAccessors(document, getAccessor) {
	for (let index = 0; index < (document.accessors || []).length; index += 1) {
		const type = document.accessors[index].type;
		if (type === 'MAT4' || type === 'SCALAR') getAccessor(index);
	}
	for (const animation of document.animations || []) {
		for (const sampler of animation.samplers || []) {
			if (sampler.input !== undefined) getAccessor(sampler.input);
			if (sampler.output !== undefined) getAccessor(sampler.output);
		}
	}
}
