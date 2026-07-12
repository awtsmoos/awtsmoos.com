// B"H
import { heightAt } from '../math.js';

/** Traffic remains persistent while mode and event rules change only its speed. */
export function updateTraffic(world, dt) {
	const limit = world.level.bounds - 110;
	const scaledDt = dt * world.rules.trafficSpeed;
	for (const object of world.level.objects) {
		if (!object.traffic || object.taken || object.sinkOwner) continue;
		moveAlongLane(object, scaledDt, limit);
		object.z = heightAt(object.x, object.y, world.level.index);
	}
}

function moveAlongLane(object, dt, limit) {
	const distance = object.speed * object.routeDirection * dt;
	if (object.routeAxis === 'x') object.x += distance;
	else object.y += distance;
	const coordinate = object.routeAxis === 'x' ? object.x : object.y;
	if (Math.abs(coordinate) > limit) object.routeDirection *= -1;
	object.rot = trafficRotation(object.routeAxis, object.routeDirection);
}

function trafficRotation(axis, direction) {
	if (axis === 'x') return direction > 0 ? Math.PI / 2 : -Math.PI / 2;
	return direction > 0 ? Math.PI : 0;
}
