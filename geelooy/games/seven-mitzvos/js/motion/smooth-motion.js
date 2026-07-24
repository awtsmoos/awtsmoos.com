//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module SmoothMotion
 * @description
 * Created motion should possess intention rather than snapping between points.
 * The Awtsmoos renews traveler and road each instant; Awtsmoos.com uses bounded,
 * frame-rate-independent damping so crowds remain smooth on fast and slow glass.
 */
export function assignRoute(actor, route, options = {}) {
	actor.userData.motion = {
		route,
		index: options.index || 0,
		maxSpeed: options.maxSpeed || 2,
		response: options.response || 5,
		turnRate: options.turnRate || 8,
		arrival: options.arrival || 0.12,
		facingOffset: options.facingOffset || 0,
		pause: options.pause || 0,
		pauseLeft: 0
	};
	return actor;
}

export function replaceRoute(actor, route, index = 0) {
	const motion = actor.userData.motion;
	if (!motion) {
		return assignRoute(actor, route, { index });
	}
	motion.route = route;
	motion.index = index;
	motion.pauseLeft = 0;
	return actor;
}

export function advanceRoute(actor, delta) {
	const motion = actor.userData.motion;
	if (!motion?.route?.length) {
		return false;
	}
	if (motion.pauseLeft > 0) {
		motion.pauseLeft = Math.max(0, motion.pauseLeft - delta);
		return false;
	}
	const target = motion.route[motion.index % motion.route.length];
	const moving = moveTo(actor, target[0], target[1], delta, motion);
	if (!moving) {
		motion.index = (motion.index + 1) % motion.route.length;
		motion.pauseLeft = motion.pause;
	}
	return moving;
}

export function moveTo(actor, targetX, targetZ, delta, options = {}) {
	const dx = targetX - actor.position.x;
	const dz = targetZ - actor.position.z;
	const distance = Math.hypot(dx, dz);
	const arrival = options.arrival || 0.08;
	if (distance <= arrival) {
		actor.position.x = targetX;
		actor.position.z = targetZ;
		return false;
	}
	const responseStep = distance * dampFactor(options.response || 6, delta);
	const speedStep = (options.maxSpeed || 3) * delta;
	const step = Math.min(distance, responseStep, speedStep);
	actor.position.x += dx / distance * step;
	actor.position.z += dz / distance * step;
	faceDirection(actor, dx, dz, delta, options);
	return true;
}

export function followActor(actor, leader, delta, options = {}) {
	const spacing = options.spacing || 0.8;
	const targetX = leader.position.x - Math.sin(leader.rotation.y) * spacing;
	const targetZ = leader.position.z - Math.cos(leader.rotation.y) * spacing;
	return moveTo(actor, targetX, targetZ, delta, options);
}

export function faceDirection(actor, dx, dz, delta, options = {}) {
	if (Math.abs(dx) + Math.abs(dz) < 0.001) {
		return;
	}
	const desired = Math.atan2(dx, dz) + (options.facingOffset || 0);
	const difference = shortestAngle(desired - actor.rotation.y);
	actor.rotation.y += difference * dampFactor(options.turnRate || 8, delta);
}

export function dampFactor(rate, delta) {
	return 1 - Math.exp(-Math.max(0, rate) * Math.max(0, delta));
}

function shortestAngle(value) {
	return Math.atan2(Math.sin(value), Math.cos(value));
}
