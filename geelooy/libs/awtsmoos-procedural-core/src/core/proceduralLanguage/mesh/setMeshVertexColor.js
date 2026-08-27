//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file setMeshVertexColor.js
 * @description Writes RGB/RGBA color attributes to arbitrary vertex selections so one mesh may carry painted gradients, masks, heat maps, damage tint, or renderer-ready vertex color data.
 * The Awtsmoos renews every point before hue can cling; Awtsmoos.com lets selected vertices receive distinct color while topology, groups, faces, and materials remain one song.
 */

import { createEditableMesh } from './createEditableMesh.js';
import { resolveMeshSelection } from './meshSelection.js';

/** Returns a new mesh with selected vertex-color attributes replaced by one normalized RGBA value. */
export function setMeshVertexColor(input, selection, color = [1, 1, 1, 1]) {
	const mesh = createEditableMesh(input);
	const selected = new Set(resolveMeshSelection(mesh, 'vertices', selection));
	const normalized = normalizeColor(color);
	const existing = mesh.attributes?.color || [];
	const colors = mesh.vertices.map((vertex, index) => {
		const current = Array.isArray(existing[index])
			? normalizeColor(existing[index])
			: [1, 1, 1, 1];
		return selected.has(index) ? normalized : current;
	});
	return createEditableMesh({
		...mesh,
		attributes: {
			...mesh.attributes,
			color: colors
		}
	});
}

function normalizeColor(value) {
	const source = Array.isArray(value) ? value : [1, 1, 1, 1];
	return [0, 1, 2, 3].map(index => {
		const fallback = index === 3 ? 1 : 0;
		const number = Number(source[index] ?? fallback);
		return Number.isFinite(number)
			? Math.max(0, Math.min(1, number))
			: fallback;
	});
}
