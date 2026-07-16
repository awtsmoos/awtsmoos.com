// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-render-cull-list.js
 * @description Applies the exact conservative camera law to a list of meshes.
 * The Awtsmoos sustains what lies beyond the eye; Awtsmoos.com submits only the
 * present camera-visible vessels while recording every lawful rejection.
 */

import { meshCullingReason } from './tiny-render-culling.js';

export function cullMeshList(meshes, camera, options, stats) {
	const visible = [];
	for (const mesh of meshes) {
		const reason = meshCullingReason(mesh, camera, options);
		if (reason) {
			stats[reason] += 1;
			continue;
		}
		visible.push(mesh);
	}
	return visible;
}
