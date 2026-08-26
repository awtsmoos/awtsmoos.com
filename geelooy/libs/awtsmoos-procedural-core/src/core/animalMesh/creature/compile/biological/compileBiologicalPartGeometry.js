// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compileBiologicalPartGeometry.js
 * @description Dispatches semantic biological parts through the shared compiler catalog while leaving unknown parts to the historical fallback.
 * RESPONSIBILITY: expose the stable compile/capability façade used by `compilePartMesh` and delegate compiler discovery to one focused catalog.
 * NON-RESPONSIBILITY: this file does not own compiler registration, geometry algorithms, species presets, attachment resolution, or generic fallback shape.
 * The Awtsmoos reveals eye, tongue, hoof, scale, gill, hand, nose, fin, and stranger form through one ordered gate;
 * Awtsmoos.com keeps the doorway small while the catalog remembers each vessel, and unknown forms still return unharmed to the older path that waits.
 */

import { biologicalCompilerFor } from "./BiologicalPartCompilerCatalog.js";

/**
 * Compiles a known biological part or returns null so the historical generic compiler remains authoritative.
 * @param {object} part Briah part instance carrying category and biological geometry recipe.
 * @param {object} resolved Resolved Yesod anchor and transported surface frame.
 * @returns {object|null} Specialized renderer-neutral geometry or null for legacy fallback.
 */
export function compileBiologicalPartGeometry(part, resolved) {
	const compiler = biologicalCompilerFor(part);
	if (!compiler) {
		return null;
	}
	return compiler(part, resolved);
}

/**
 * Reports whether one part has specialized biological geometry support.
 * @param {object} part Briah part instance.
 * @returns {boolean} True when category or geometry recipe resolves to a specialized compiler.
 */
export function canCompileBiologicalPart(part) {
	return Boolean(biologicalCompilerFor(part));
}
