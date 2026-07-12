// B"H
import { clamp, dist, heightAt, norm } from '../math.js';
import { captureForHole } from './absorption.js';
import { chooseStrategicTarget, rivalSpeedScale, strategicDirection } from './rivalStrategies.js';

/** Seven archetypes share one movement vessel while making different decisions. */
export function updateRivals(world, dt) {
	for (const rival of world.rivals) updateRival(world, rival, dt);
}

function updateRival(world, rival, dt) {
	rival.grace = Math.max(0, rival.grace - dt);
	if (rival.respawn > 0) {
		rival.respawn = Math.max(0, rival.respawn - dt);
		return;
	}
	rival.think -= dt;
	if (rival.think <= 0) chooseTarget(world, rival);
	const target = targetFor(world, rival);
	const desired = strategicDirection(world, rival, target);
	const flee = fleeVector(world, rival);
	const ruleScale = world.rules.rivalSpeed * rivalSpeedScale(rival);
	rival.vx += (desired.x + flee.x * 1.6) * 760 * ruleScale * dt;
	rival.vy += (desired.y + flee.y * 1.6) * 760 * ruleScale * dt;
	limitVelocity(rival, ruleScale);
	rival.vx *= Math.pow(0.004, dt);
	rival.vy *= Math.pow(0.004, dt);
	rival.x = clamp(rival.x + rival.vx * dt, -world.level.bounds, world.level.bounds);
	rival.y = clamp(rival.y + rival.vy * dt, -world.level.bounds, world.level.bounds);
	rival.z = heightAt(rival.x, rival.y, world.level.index);
	captureForHole(world, rival, dt, false);
}

function chooseTarget(world, rival) {
	const target = chooseStrategicTarget(world, rival);
	rival.targetId = target?.id ?? null;
	rival.think = 0.19 + (rival.index % 4) * 0.035;
}

function targetFor(world, rival) {
	return world.level.objects.find(object => object.id === rival.targetId && !object.taken) || world.player;
}

function limitVelocity(rival, scale) {
	const maxSpeed = clamp(430 - rival.r * 1.9, 220, 390) * Math.min(1.45, scale);
	const speed = Math.hypot(rival.vx, rival.vy) || 1;
	if (speed <= maxSpeed) return;
	rival.vx = rival.vx / speed * maxSpeed;
	rival.vy = rival.vy / speed * maxSpeed;
}

function fleeVector(world, rival) {
	const danger = [world.player, ...world.rivals].find(hole =>
		hole.id !== rival.id && hole.r > rival.r * 1.18 && dist(hole, rival) < hole.r * 5
	);
	return danger ? norm({ x: rival.x - danger.x, y: rival.y - danger.y }) : { x: 0, y: 0 };
}
