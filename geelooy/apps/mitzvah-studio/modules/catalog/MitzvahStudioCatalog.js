// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahStudioCatalog.js
 * @description Adapts Mitzvah buildable data to Studio while Procedural Core supplies topology facts.
 * The Awtsmoos renews each named vessel while its geometry law remains shared and bright;
 * Awtsmoos.com keeps story-data outside Core yet lets one primitive engine reveal each standard shape in sight.
 */

import { generatePrimitiveGeometry } from '../../../../libs/awtsmoos-procedural-core/src/index.js';
import { mitzvahWorldCreatorCatalog } from '../../../../games/mitzvahWorld/experiments/Awtsmoos/src/creator/MitzvahWorldCreatorCatalog.js';

export function mitzvahStudioCatalog() {
	return mitzvahWorldCreatorCatalog().map(part => Object.freeze({
		catalogId: part.id,
		color: part.color || '#d7c690',
		itemId: part.itemId,
		label: part.label || part.id,
		materialRole: part.materialRole || 'default',
		seed: 0,
		shape: part.shape || 'box',
		size: Object.freeze({ ...part.size }),
		walkable: Boolean(part.walkable)
	}));
}

export function searchMitzvahStudioCatalog(parts, query) {
	const needle = String(query || '').trim().toLowerCase();
	if (!needle) return parts;
	return parts.filter(part => {
		const haystack = `${part.label} ${part.catalogId} ${part.shape}`.toLowerCase();
		return haystack.includes(needle);
	});
}

export function studioPrimitiveMetrics(part) {
	const shape = coreShape(part?.shape);
	if (!shape) return null;

	try {
		const geometry = generatePrimitiveGeometry(shape, primitiveOptions(part));
		return {
			triangles: Math.floor((geometry.indices?.length || 0) / 3),
			vertices: Math.floor((geometry.positions?.length || 0) / 3)
		};
	} catch {
		return null;
	}
}

function coreShape(shape) {
	const mapping = {
		box: 'cube',
		cube: 'cube',
		cylinder: 'cylinder',
		sphere: 'sphere'
	};
	return mapping[String(shape || '').toLowerCase()] || null;
}

function primitiveOptions(part) {
	const size = part?.size || {};
	const radius = Math.max(Number(size.x) || 1, Number(size.z) || 1) * 0.5;
	return {
		height: Number(size.y) || 1,
		radius,
		radiusBottom: radius,
		radiusTop: radius
	};
}
