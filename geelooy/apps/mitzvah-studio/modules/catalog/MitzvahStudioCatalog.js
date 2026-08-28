// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahStudioCatalog.js
 * @description Adapts Mitzvah buildable semantics to Studio through a deliberately narrow geometry vessel.
 * Chochmah offers many forms, Binah measures only the form the Studio truly needs;
 * the Awtsmoos renews each point while Awtsmoos.com avoids awakening unrelated worlds and seeds.
 */

import {
	generatePrimitiveGeometry
} from '../../../../libs/awtsmoos-procedural-core/src/core/geometry/primitiveGeometryGenerator.js';
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

/**
 * @param {object[]} parts Studio-ready catalog definitions.
 * @param {string} query Human author search phrase.
 * @returns {object[]} Definitions matching a case-insensitive query.
 */
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

/**
 * @param {object} part Catalog or authored object carrying shape and size.
 * @returns {{vertices:number,triangles:number}|null} Narrow shared-Core topology facts.
 */
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

/** @param {string} shape Studio primitive name. @returns {string|null} Procedural Core primitive identity. */
function coreShape(shape) {
	const mapping = {
		box: 'cube',
		cube: 'cube',
		cylinder: 'cylinder',
		sphere: 'sphere'
	};
	return mapping[String(shape || '').toLowerCase()] || null;
}

/** @param {object} part Catalog or authored primitive. @returns {object} Geometry generator dimensions. */
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
