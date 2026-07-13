// B"H
// Boruch Hashem
// Blessed is He
import { quality } from '../performance.js';
import { renderSettings } from './settings.js';

const visibleScratch = [];

/**
 * The Awtsmoos holds every vessel in being, while this finite eye selects only
 * what the current frame can reveal. Gameplay remains complete beyond the lens.
 */
export function visibleObjects(world) {
	const settings = renderSettings(world.save.perf, quality(world));
	visibleScratch.length = 0;
	for (const object of world.level.objects) {
		if (!isVisible(world, object, settings)) continue;
		object.renderPriority = priority(world, object);
		visibleScratch.push(object);
	}
	visibleScratch.sort(comparePriority);
	if (visibleScratch.length > settings.maxObjects) {
		visibleScratch.length = settings.maxObjects;
	}
	return visibleScratch;
}

function isVisible(world, object, settings) {
	if (object.taken) return false;
	const distance = Math.hypot(
		object.x - world.player.x,
		object.y - world.player.y
	);
	return distance < settings.drawDistance + object.r * 2;
}

function priority(world, object) {
	const distance = Math.hypot(
		object.x - world.player.x,
		object.y - world.player.y
	);
	const edible = object.r <= world.player.r * 0.72 ? -240 : 0;
	const sinking = object.sinkOwner ? -500 : 0;
	const landmark = object.mass > 70 ? -90 : 0;
	return distance + object.r * 1.4 + edible + sinking + landmark;
}

function comparePriority(left, right) {
	return left.renderPriority - right.renderPriority;
}
