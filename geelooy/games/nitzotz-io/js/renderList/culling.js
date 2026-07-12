// B"H
import { quality } from '../performance.js';
import { renderSettings } from './settings.js';

/**
 * Rendering culls by distance and frame budget while gameplay preserves the full
 * object array. This is visibility management, never world replacement.
 */
export function visibleObjects(world) {
	const config = renderSettings(world.save.perf, quality(world));
	return world.level.objects
		.filter(object => !object.taken && nearPlayer(world, object, config))
		.map(object => ({ object, priority: priority(world, object) }))
		.sort((a, b) => a.priority - b.priority)
		.slice(0, config.maxObjects)
		.map(entry => entry.object);
}

function nearPlayer(world, object, config) {
	const distance = Math.hypot(object.x - world.player.x, object.y - world.player.y);
	return distance < config.drawDistance + object.r * 2;
}

function priority(world, object) {
	const distance = Math.hypot(object.x - world.player.x, object.y - world.player.y);
	const edible = object.r <= world.player.r * 0.72 ? -240 : 0;
	const sinking = object.sinkOwner ? -500 : 0;
	const landmark = object.mass > 70 ? -90 : 0;
	return distance + object.r * 1.4 + edible + sinking + landmark;
}
