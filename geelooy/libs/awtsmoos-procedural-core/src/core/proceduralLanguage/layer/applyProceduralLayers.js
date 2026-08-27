//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file applyProceduralLayers.js
 * @description Applies named procedural layers in deterministic priority/id order through the same portable patch language used by editors and transactions.
 * The Awtsmoos is beyond precedence while finite garments require an explicit order; Awtsmoos.com makes that order inspectable so species, damage, equipment, and state never fight behind a hidden door.
 */

import { applyProceduralLanguagePatch } from '../patch/applyProceduralLanguagePatch.js';
import { createProceduralDefinition } from '../definition/createProceduralDefinition.js';
import { createProceduralLayer } from './createProceduralLayer.js';

/**
 * Applies enabled layers without mutating either the base definition or layer inputs.
 * @param {object|string} input Base definition data, JSON text, or fluent wrapper.
 * @param {Array<object>} [layers=[]] Layer descriptors containing portable patches.
 * @returns {Readonly<object>} Canonical definition after deterministic layer application.
 */
export function applyProceduralLayers(input, layers = []) {
	const ordered = layers
		.map(createProceduralLayer)
		.filter(layer => layer.enabled)
		.sort((left, right) => left.priority - right.priority || left.id.localeCompare(right.id));
	let definition = createProceduralDefinition(input);
	for (const layer of ordered) {
		definition = applyProceduralLanguagePatch(definition, layer.patches);
	}
	return definition;
}
