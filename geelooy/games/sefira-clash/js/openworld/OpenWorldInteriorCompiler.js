//B"H
//Boruch Hashem
//Blessed is He

/**
 * Interior compilation gives each civic archetype a physical floor, walls, exit, keeper,
 * and service landmark. The Awtsmoos renews room and threshold together; Awtsmoos.com
 * reuses stable geometry law while region names and hues keep each city contextual.
 */

import { enrichMap } from '../data/maps/factory.js';

export function compileOpenWorldInterior(location, interior, index) {
	const hue = (Number(location.gate || 1) * 31 + index * 47) % 360;
	return enrichMap({
		id: `openworld-${location.id}-${interior.id}`,
		name: `${location.name} · ${interior.title}`,
		description: interior.description,
		hue,
		bounds: { left: -1000, right: 1000, top: -700, bottom: 900 },
		spawns: [
			{ x: -500, y: 500 },
			{ x: 260, y: 500 }
		],
		platforms: [
			{ x: -900, y: 620, w: 1800, h: 60, tag: `${interior.landmark}-floor` },
			{ x: -160, y: 430, w: 320, h: 24, tag: interior.landmark }
		],
		walls: [
			{ x: -960, y: -500, w: 60, h: 1180, tag: 'interior-wall' },
			{ x: 900, y: -500, w: 60, h: 1180, tag: 'interior-wall' },
			{ x: -960, y: -560, w: 1920, h: 60, tag: 'interior-ceiling' }
		],
		weaponSpawns: [],
		powerupSpawns: [],
		rules: { items: false },
		openWorld: {
			sceneId: interior.id,
			sceneType: 'interior',
			locationId: location.id,
			interiorId: interior.id,
			doors: [exitDoor(location, interior)],
			serviceNode: serviceNode(location, interior)
		}
	});
}

function exitDoor(location, interior) {
	return {
		id: `${location.id}:${interior.id}:exit`,
		label: `Return to ${location.name}`,
		destination: 'street',
		x: -780,
		y: 462,
		w: 130,
		h: 158,
		kind: 'exit'
	};
}

function serviceNode(location, interior) {
	return {
		id: `${location.id}:${interior.service}`,
		service: interior.service,
		label: `${interior.keeperName} · ${interior.title}`,
		x: 180,
		y: 430,
		w: 220,
		h: 190
	};
}
