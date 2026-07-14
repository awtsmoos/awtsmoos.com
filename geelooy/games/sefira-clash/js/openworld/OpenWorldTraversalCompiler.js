//B"H
//Boruch Hashem
//Blessed is He

/**
 * Traversal compilation places three patrol points, two clues, one ladder, and one lift
 * across each authored street. The Awtsmoos renews road and opportunity; Awtsmoos.com
 * derives bounded rectangles from existing map limits so no node leaves physical space.
 */

import { OPEN_WORLD_TRAVERSAL_TYPES } from '../data/openworld/OpenWorldTraversalCatalog.js';

export function compileOpenWorldTraversalNodes(map, location, floorY) {
	const ratios = [0.12, 0.28, 0.44, 0.6, 0.74, 0.86, 0.94];
	const kinds = ['patrol', 'clue', 'patrol', 'ladder', 'clue', 'patrol', 'lift'];
	const left = map.bounds.left + 140;
	const span = map.bounds.right - map.bounds.left - 280;
	return kinds.map((kind, index) => {
		const type = OPEN_WORLD_TRAVERSAL_TYPES[kind];
		const x = Math.round(left + span * ratios[index]);
		return {
			id: `${location.id}:${kind}:${index}`,
			kind,
			label: type.label,
			eventType: type.eventType,
			targetId: type.targetId,
			x: x - 45,
			y: floorY - 110,
			w: 90,
			h: 110,
			destination: traversalDestination(kind, x, floorY)
		};
	});
}

function traversalDestination(kind, x, floorY) {
	if (kind === 'ladder') return { x, y: floorY - 250 };
	if (kind === 'lift') return { x, y: floorY - 330 };
	return null;
}
