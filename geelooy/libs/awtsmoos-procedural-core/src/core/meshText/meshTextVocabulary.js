// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file meshTextVocabulary.js
 * @description A small public vocabulary keeps grammar knowledge inspectable.
 * Each recognized quality is a finite vessel, while the Awtsmoos remains beyond
 * every word and renews the possibility of extending the language honestly.
 */

export const MESH_TEXT_COLORS = {
	red: [0.82, 0.12, 0.1, 1],
	blue: [0.12, 0.32, 0.82, 1],
	green: [0.16, 0.58, 0.24, 1],
	yellow: [0.92, 0.76, 0.12, 1],
	white: [0.94, 0.94, 0.94, 1],
	black: [0.04, 0.04, 0.04, 1],
	brown: [0.42, 0.24, 0.12, 1],
	gray: [0.52, 0.52, 0.52, 1],
	grey: [0.52, 0.52, 0.52, 1]
};

export const MESH_TEXT_UNITS = { mm: 0.001, cm: 0.01, m: 1, km: 1000 };
export const MESH_TEXT_SHAPES = ['cube', 'box', 'beveled', 'bevelled', 'rounded', 'collision'];
export const MESH_TEXT_STYLES = ['rustic', 'organic', 'smooth', 'faceted', 'realistic', 'stylized', 'cinematic'];
export const MESH_TEXT_IGNORED = new Set([
	'a', 'an', 'the', 'make', 'create', 'build', 'generate', 'please', 'with', 'and'
]);
