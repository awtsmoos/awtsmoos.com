// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file meshTextCompiler.js
 * @description A modest grammar turns plain requests into inspectable recipes.
 * Nothing is concealed: recognized words, defaults, and unknowns remain visible
 * as the Awtsmoos reveals intention through ordered, editable form.
 */

import { createMeshRecipe } from '../recipes/meshRecipe.js';
import {
	createMeshTextLods,
	markMeshTextLength,
	parseMeshTextDimensions,
	parseMeshTextLength
} from './meshTextMeasurements.js';
import { tokenizeMeshText } from './meshTextTokenizer.js';
import {
	MESH_TEXT_COLORS,
	MESH_TEXT_IGNORED,
	MESH_TEXT_SHAPES,
	MESH_TEXT_STYLES
} from './meshTextVocabulary.js';

function compileKeyword(tokens, index, state, used) {
	const value = tokens[index].value;
	const length = parseMeshTextLength(tokens, index + 1);
	used.add(index);

	if (!length) {
		return;
	}

	markMeshTextLength(used, index + 1, length);
	if (value === 'size') state.dimensions = { size: length.value };
	if (value === 'bevel') state.bevel = length.value;
	if (value === 'seed') state.seed = Math.trunc(length.value);
	if (value === 'lod') state.lodCount = Math.max(1, Math.trunc(length.value));
}

/** @param {string} text Description. @param {object} options Overrides. @returns {object} MeshRecipe. */
export function compileMeshText(text, options = {}) {
	const tokens = tokenizeMeshText(text);
	const used = new Set();
	const state = {
		dimensions: { size: 1 },
		color: MESH_TEXT_COLORS.gray,
		bevel: 0,
		seed: options.seed || 0,
		quality: options.quality || 'medium',
		style: options.style || 'neutral',
		lodCount: 1
	};

	for (let index = 0; index < tokens.length; index += 1) {
		if (used.has(index)) {
			continue;
		}

		const value = tokens[index].value;
		const dimensions = parseMeshTextDimensions(value);
		const standaloneLength = parseMeshTextLength(tokens, index);

		if (dimensions) {
			state.dimensions = dimensions;
			used.add(index);
		} else if (MESH_TEXT_COLORS[value]) {
			state.color = MESH_TEXT_COLORS[value];
			used.add(index);
		} else if (MESH_TEXT_SHAPES.includes(value)) {
			used.add(index);
		} else if (MESH_TEXT_STYLES.includes(value)) {
			state.style = value;
			used.add(index);
		} else if (['size', 'bevel', 'seed', 'lod'].includes(value)) {
			compileKeyword(tokens, index, state, used);
		} else if (value === 'quality' && tokens[index + 1]) {
			state.quality = tokens[index + 1].value;
			used.add(index);
			used.add(index + 1);
		} else if (standaloneLength) {
			state.dimensions = { size: standaloneLength.value };
			markMeshTextLength(used, index, standaloneLength);
		}
	}

	const rounded = tokens.some(token => ['beveled', 'bevelled', 'rounded'].includes(token.value))
		|| state.bevel > 0;
	const unknown = tokens
		.filter((token, index) => !used.has(index) && !MESH_TEXT_IGNORED.has(token.value))
		.map(token => token.value);

	return createMeshRecipe({
		seed: state.seed,
		style: state.style,
		quality: state.quality,
		dimensions: state.dimensions,
		generator: rounded ? 'primitive.beveledBox' : 'primitive.box',
		materials: [{ id: 'primary', color: state.color }],
		operations: rounded ? [{ type: 'bevel', amount: state.bevel || 0.08 }] : [],
		lods: createMeshTextLods(state.lodCount),
		metadata: { sourceText: String(text || '') },
		diagnostics: {
			recognized: tokens.filter((token, index) => used.has(index)).map(token => token.value),
			defaults: ['units:m', rounded && !state.bevel ? 'bevel:0.08' : null].filter(Boolean),
			unknown
		}
	});
}
