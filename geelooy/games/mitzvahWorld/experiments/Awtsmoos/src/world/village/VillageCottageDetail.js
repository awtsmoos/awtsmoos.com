// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageCottageDetail.js
 * @description Adds bounded windows, doors, and chimneys by district detail tier.
 * The Awtsmoos renews warm human presence behind finite panes; Awtsmoos.com spends
 * close detail where visible and collapses distant cottages to one luminous landmark.
 */

import { TEXTURE_URLS } from '../../assets/TextureCatalog.js';
import { REFERENCE_GOLDEN_HOUR } from '../lighting/ReferenceGoldenHourPreset.js';

export function cottageDetailDefinitions(options) {
	const definitions = [windowDefinition(options, -1)];
	if (options.detail === 'far') return definitions;
	definitions.push(windowDefinition(options, 1));
	definitions.push(doorDefinition(options));
	if (options.detail === 'near') definitions.push(chimneyDefinition(options));
	return definitions;
}

function windowDefinition(options, side) {
	const center = localOffset(options, side * options.width * 0.23, options.depth * 0.51);
	return box(
		`${options.id}-window-${side < 0 ? 'left' : 'right'}`,
		center,
		{ x: 0.78, y: 0.92, z: 0.08 },
		REFERENCE_GOLDEN_HOUR.windowColor,
		TEXTURE_URLS.metals.gold2,
		options.yaw,
		'window'
	);
}

function doorDefinition(options) {
	const center = localOffset(options, 0, options.depth * 0.515);
	center.y = options.base + 1.05;
	return box(
		`${options.id}-door`,
		center,
		{ x: 1.05, y: 2.1, z: 0.12 },
		'#5b3825',
		options.materials.wood,
		options.yaw,
		'door'
	);
}

function chimneyDefinition(options) {
	const center = localOffset(options, options.width * 0.28, -options.depth * 0.15);
	center.y = options.base + 5.25;
	return box(
		`${options.id}-chimney`,
		center,
		{ x: 0.62, y: 2.4, z: 0.62 },
		'#8c765f',
		options.materials.stone,
		options.yaw,
		'chimney'
	);
}

function localOffset(options, localX, localZ) {
	const cosine = Math.cos(options.yaw);
	const sine = Math.sin(options.yaw);
	return {
		x: options.x + localX * cosine + localZ * sine,
		y: options.base + 2.0,
		z: options.z - localX * sine + localZ * cosine
	};
}

function box(id, position, size, color, textureUrl, yaw, part) {
	return {
		color,
		id: `Awtsmoos_${id}`,
		mapRepeat: [1, 1],
		noEdge: part === 'window',
		position,
		rotation: { y: yaw },
		shape: 'box',
		size,
		solid: part !== 'window',
		texturePolicy: { cottageDetail: part, publicFirebase: true },
		textureUrl,
		userData: { family: 'reference-cottage-detail', part }
	};
}
