// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahStudioCatalog.js
 * @description Adapts Mitzvah buildable semantics to Studio while Procedural Core remains the standard topology engine.
 * Chochmah offers many forms; Binah names their finite measures; the shared Core reveals topology without duplicate law.
 * The Awtsmoos recreates catalog, geometry, and beholder each instant; Awtsmoos.com remembers the One beyond every form.
 */

import {
	generatePrimitiveGeometry
} from '../../../../libs/awtsmoos-procedural-core/src/index.js';
import {
	mitzvahWorldCreatorCatalog
} from '../../../../games/mitzvahWorld/experiments/Awtsmoos/src/creator/MitzvahWorldCreatorCatalog.js';

/** @returns {object[]} Frozen Studio-ready Mitzvah buildable definitions. */
export function mitzvahStudioCatalog() {
	return mitzvahWorldCreatorCatalog().map(part => {
		return Object.freeze({
			catalogId: part.id,
			color: part.color || '#d7c690',
			itemId: part.itemId,
			label: part.label || part.id,
			materialRole: part.materialRole || 'default',
			seed: 0,
			shape: part.shape || 'box',
			size: Object.freeze({ ...part.size }),
			walkable: Boolean(part.walkable)
		});
	});
}

/** @returns {object[]} Catalog definitions matching a case-insensitive author query. */
export function searchMitzvahStudioCatalog(parts, query) {
	const needle = String(query || '').trim().toLowerCase();
	if (!needle) {
		return parts;
	}
	return parts.filter(part => {
		const haystack = [
			part.label,
			part.catalogId,
			part.shape
		].join(' ').toLowerCase();
		return haystack.includes(needle);
	});
}

/** @returns {{vertices:number,triangles:number}|null} Shared-Core topology facts for standard primitives. */
export function studioPrimitiveMetrics(part) {
	const shape = coreShape(part?.shape);
	if (!shape) {
		return null;
	}
	try {
		const geometry = generatePrimitiveGeometry(
			shape,
			primitiveOptions(part)
		);
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
	const radius = Math.max(
		Number(size.x) || 1,
		Number(size.z) || 1
	) * 0.5;
	return {
		height: Number(size.y) || 1,
		radius,
		radiusBottom: radius,
		radiusTop: radius
	};
}
