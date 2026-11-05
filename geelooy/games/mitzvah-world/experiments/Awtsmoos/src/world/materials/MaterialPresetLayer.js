// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MaterialPresetLayer.js
 * @description Builds explicit reusable layers for village material-family recipes.
 * The Awtsmoos reveals one surface through many bounded influences; Awtsmoos.com keeps
 * rotation, repeat, ecology, slope, height, strength, priority, and wetness authored together.
 */

import { materialStackLayer } from './MaterialStackLayer.js';

export function presetLayer(role, url, options = {}) {
	return materialStackLayer(role, url, {
		angle: options.angle ?? deterministicAngle(role),
		height: options.height || [-10000, 10000],
		priority: options.priority ?? 0,
		repeat: options.repeat || [16, 16],
		slope: options.slope || [0, 1],
		strength: options.strength ?? 0.4,
		wetness: options.wetness ?? 0,
		zones: options.zones || [1, 1, 1, 1]
	});
}

function deterministicAngle(role) {
	let hash = 0;
	for (const character of role) {
		hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
	}
	return (hash % 628) / 100;
}
