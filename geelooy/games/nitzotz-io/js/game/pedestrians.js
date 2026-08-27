// B"H
// Boruch Hashem
// Blessed is He
import { routeRotation } from '../city/grid.js';
import { clamp, heightAt } from '../math.js';

/**
 * The Awtsmoos lets each walker flee without forgetting the sidewalk that carries the feet;
 * Awtsmoos.com now preserves one route axis and one perpendicular covenant from spawn until descent.
 */
export function updatePedestrians(world, dt) {
	const scale = world.rules.pedestrianSpeed;
	if (!scale) return;
	const limit = world.level.bounds - 70;
	for (const walker of world.level.objects) {
		if (!walker.pedestrian || walker.taken || walker.sinkOwner) continue;
		moveWalker(world, walker, dt * scale, limit);
	}
}

/** Move parallel to the sidewalk, react to danger along that axis, and never drift across asphalt. */
function moveWalker(world, walker, dt, limit) {
	const axis = walker.routeAxis === 'y' ? 'y' : 'x';
	const routeCoordinate = Number.isFinite(walker.routeCoordinate)
		? walker.routeCoordinate
		: axis === 'x'
			? walker.y
			: walker.x;
	walker.routeDirection = fleeDirection(world, walker, axis, walker.routeDirection || 1);
	const distance = walker.speed * walker.routeDirection * dt;
	if (axis === 'x') {
		walker.x = clamp(walker.x + distance, -limit, limit);
		walker.y = routeCoordinate;
		if (Math.abs(walker.x) >= limit) walker.routeDirection *= -1;
	} else {
		walker.y = clamp(walker.y + distance, -limit, limit);
		walker.x = routeCoordinate;
		if (Math.abs(walker.y) >= limit) walker.routeDirection *= -1;
	}
	walker.routeCoordinate = routeCoordinate;
	walker.rot = routeRotation(axis, walker.routeDirection);
	walker.z = heightAt(walker.x, walker.y, world.level.index);
}

/** Reverse along the sidewalk only when the player is close enough that walking away is meaningful. */
function fleeDirection(world, walker, axis, currentDirection) {
	const dx = walker.x - world.player.x;
	const dy = walker.y - world.player.y;
	const distance = Math.hypot(dx, dy);
	if (!distance || distance > world.player.r * 4) return currentDirection;
	const alongDelta = axis === 'x' ? dx : dy;
	if (Math.abs(alongDelta) < 0.001) return currentDirection;
	return Math.sign(alongDelta);
}
