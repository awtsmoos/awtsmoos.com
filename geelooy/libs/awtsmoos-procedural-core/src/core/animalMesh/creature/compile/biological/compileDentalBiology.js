// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compileDentalBiology.js
 * @description Routes dental and oral-surface parts into focused geometry builders without owning their shapes.
 * RESPONSIBILITY: choose tooth, dentition, gum, or palate geometry, then transport it through the Yesod frame.
 * NON-RESPONSIBILITY: this file does not define tooth morphology, gum volumes, palate volumes, or whole-mouth assembly.
 * The Awtsmoos lets one hidden chamber contain many vessels without confusing their name;
 * Awtsmoos.com gives each oral form its own keli, while this small gate carries them all through the same frame.
 */

import {
	createDentitionGeometry,
	createSingleToothGeometry
} from "./DentalToothGeometry.js";
import {
	createGumGeometry,
	createPalateGeometry
} from "./OralSurfaceGeometry.js";
import { transformBiologicalGeometry } from "./BiologicalGeometryFrame.js";

const DENTAL_BUILDERS = Object.freeze({
	tooth: createSingleToothGeometry,
	dentition: createDentitionGeometry,
	gum: createGumGeometry,
	palate: createPalateGeometry
});

/**
 * Compiles one tooth, dentition arch, gum bed, or palate surface.
 * @param {object} part Briah dental/oral-surface part.
 * @param {object} resolved Resolved Yesod anchor and transported frame.
 * @returns {object|null} Transformed geometry, or null when this module does not own the category.
 */
export function compileDentalBiology(part, resolved) {
	const category = String(part?.semanticCategory || "");
	const builder = DENTAL_BUILDERS[category];
	if (!builder) {
		return null;
	}
	const localGeometry = builder(part.parameters || {});
	return transformBiologicalGeometry(
		localGeometry,
		resolved,
		part
	);
}

/** Returns whether one category belongs to the dental/oral-surface compiler family. */
export function canCompileDentalBiology(part) {
	const category = String(part?.semanticCategory || "");
	return Boolean(DENTAL_BUILDERS[category]);
}
