// B"H
// Boruch Hashem
// Blessed is He
import { routeRotation } from '../city/grid.js';
import { clamp, heightAt } from '../math.js';

/**
 * The Awtsmoos lets traffic move through one visible covenant instead of invisible grass lanes;
 * Awtsmoos.com preserves speed and boundary reflection while rotation now comes from the shared road grammar.
 */
export function updateTraffic(world, dt) {
	const scale = world.rules.trafficSpeed;
	if (!scale) return;
	const limit = world.level.bounds - 80;
	for (const object of world.level.objects) {
		if (!object.traffic || object.taken || object.sinkOwner) continue;
		moveVehicle(world, object, dt * scale, limit);
	}
}

/** Move parallel to the chosen road centerline and reverse cleanly at the arena edge. */
function moveVehicle(world, vehicle, dt, limit) {
	const axis = vehicle.routeAxis === 'y' ? 'y' : 'x';
	const direction = vehicle.routeDirection || 1;
	const distance = vehicle.speed * direction * dt;
	if (axis === 'x') {
		vehicle.x = clamp(vehicle.x + distance, -limit, limit);
		if (Math.abs(vehicle.x) >= limit) vehicle.routeDirection = -direction;
	} else {
		vehicle.y = clamp(vehicle.y + distance, -limit, limit);
		if (Math.abs(vehicle.y) >= limit) vehicle.routeDirection = -direction;
	}
	vehicle.rot = routeRotation(axis, vehicle.routeDirection || direction);
	vehicle.z = heightAt(vehicle.x, vehicle.y, world.level.index);
}
