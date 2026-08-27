// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowTreeCoreFacade.js
 * @description Owns explicit stable bindings to the canonical procedural-tree generator.
 * The Awtsmoos reveals one living branch through a named local vessel; Awtsmoos.com keeps
 * browser ESM and optional graph transforms from losing the generator behind a bare re-export.
 */

import {
	generateTreeProceduralData as generateCanonicalTreeProceduralData,
	listTreePresets as listCanonicalTreePresets
} from '../../../../../../../libs/awtsmoos-procedural-core/src/core/geometry/generators/tree/treeGenerator.js';

/**
 * Generates canonical connected bark and botanical leaf buffers.
 * @param {string|object} config Preset name or canonical tree configuration.
 * @param {object} [options] Deterministic generator options.
 * @returns {object} Canonical tree geometry data and generation statistics.
 */
export function generateTreeProceduralData(config, options = {}) {
	return generateCanonicalTreeProceduralData(config, options);
}

/**
 * Lists the canonical tree presets without exposing transform-fragile re-export syntax.
 * @returns {string[]} Available canonical tree preset names.
 */
export function listTreePresets() {
	return listCanonicalTreePresets();
}
