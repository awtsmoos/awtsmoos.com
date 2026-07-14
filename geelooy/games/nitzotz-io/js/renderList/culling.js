// B"H
// Boruch Hashem
// Blessed is He
import { quality } from '../performance.js';
import { renderSettings } from './settings.js';

const visibleScratch = [];

/**
 * The Awtsmoos holds every simulated vessel in being while this finite eye selects
 * the nearest meaningful forms. Awtsmoos.com reuses one measured distance per object.
 */
export function visibleObjects(world) {
	const settings = renderSettings(world.save.perf, quality(world));
	visibleScratch.length = 0;
	for (const object of world.level.objects) {
		if (object.taken) continue;
		const deltaX = object.x - world.player.x;
		const deltaY = object.y - world.player.y;
		const maximumDistance = settings.drawDistance + object.r * 2;
		const distanceSquared = deltaX * deltaX + deltaY * deltaY;
		if (distanceSquared >= maximumDistance * maximumDistance) continue;
		const distance = Math.sqrt(distanceSquared);
		object.renderPriority = priority(world, object, distance);
		visibleScratch.push(object);
	}
	visibleScratch.sort(comparePriority);
	if (visibleScratch.length > settings.maxObjects) {
		visibleScratch.length = settings.maxObjects;
	}
	return visibleScratch;
}

function priority(world, object, distance) {
	const edible = object.r <= world.player.r * 0.72 ? -240 : 0;
	const sinking = object.sinkOwner ? -500 : 0;
	const landmark = object.mass > 70 ? -90 : 0;
	return distance + object.r * 1.4 + edible + sinking + landmark;
}

function comparePriority(left, right) {
	return left.renderPriority - right.renderPriority;
}
