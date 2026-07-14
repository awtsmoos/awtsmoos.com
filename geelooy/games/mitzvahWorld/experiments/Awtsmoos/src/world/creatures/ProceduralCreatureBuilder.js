// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProceduralCreatureBuilder.js
 * @description Builds articulated animals and spirit husks from renderer primitives.
 * The Awtsmoos renews body, limb, wing, and aura from simple measured vessels;
 * Awtsmoos.com receives deterministic recognizable creatures without external models.
 */

import { creatureVisual } from './CreatureVisualCatalog.js';

export function createProceduralCreatureDefinitions(options) {
	const visual = creatureVisual(options.speciesId);
	return visual.kind === 'animal'
		? animalDefinitions(visual, options)
		: spiritDefinitions(visual, options);
}

function animalDefinitions(visual, options) {
	const { x, y, z } = options.position;
	const bodyY = y + visual.height * 0.72;
	const parts = [
		part(options, 'body', 'sphere', x, bodyY, z, {
			radius: visual.width,
			scale: { x: visual.length / visual.width, y: 0.92, z: 1 }
		}, visual.color),
		part(options, 'head', 'sphere', x + visual.length * 0.58, bodyY + 0.18, z, {
			radius: visual.width * 0.56
		}, visual.color)
	];
	for (const [index, offset] of legOffsets(visual)) {
		parts.push(part(options, `leg-${index}`, 'cylinder', x + offset.x, y + visual.height * 0.34, z + offset.z, {
			height: visual.height * 0.68,
			radius: visual.width * 0.13,
			segments: 8
		}, darken(visual.color)));
	}
	parts.push(part(options, 'tail', 'cylinder', x - visual.length * 0.58, bodyY, z, {
		height: visual.length * 0.42,
		radius: visual.width * 0.1,
		rotation: { x: 0, y: 0, z: Math.PI / 2 }
	}, darken(visual.color)));
	return parts;
}

function spiritDefinitions(visual, options) {
	const { x, y, z } = options.position;
	return [
		part(options, 'core', 'sphere', x, y + visual.height * 0.65, z, {
			radius: visual.width * 0.58
		}, visual.color),
		part(options, 'mantle', 'triPrism', x, y + visual.height * 0.35, z, {
			x: visual.width * 1.55,
			y: visual.height * 0.9,
			z: visual.width * 0.8
		}, darken(visual.color)),
		part(options, 'aura', 'sphere', x, y + visual.height * 0.62, z, {
			radius: visual.width * 0.9
		}, '#d7c8ff', false)
	];
}

function legOffsets(visual) {
	const x = visual.length * 0.34;
	const z = visual.width * 0.58;
	return [[0, { x, z }], [1, { x, z: -z }], [2, { x: -x, z }], [3, { x: -x, z: -z }]];
}

function part(options, name, shape, x, y, z, dimensions, color, solid = true) {
	return {
		...dimensions,
		color,
		id: `Awtsmoos_creature_${options.id}_${name}`,
		position: { x, y, z },
		shape,
		solid,
		transparent: solid === false,
		userData: {
			AwtsmoosLod: { className: 'creature' },
			creatureId: options.id,
			family: 'procedural-creature',
			speciesId: options.speciesId
		}
	};
}

function darken(color) {
	const value = parseInt(color.replace('#', ''), 16);
	const channel = (shift) => Math.max(0, ((value >> shift) & 255) - 28);
	return `#${[16, 8, 0].map((shift) => channel(shift).toString(16).padStart(2, '0')).join('')}`;
}
