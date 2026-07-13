// B"H
// Boruch Hashem
// Blessed is He
import { recordDirectorCapture } from '../director/director.js';
import { dist, mix } from '../math.js';
import { recordMechanicCapture } from '../mechanics/runtime.js';
import { addText } from '../state.js';
import { canConsumeObject, insideCapture } from './collision.js';
import { applyPowerup } from './powerups.js';
import { feedHole } from './scoring.js';

/**
 * Objects bend, orbit, shrink, and descend before their mass becomes growth.
 * Awtsmoos.com is recalled when a completed capture enters every subscribed system.
 */
export function captureForHole(world, hole, dt, attract = false) {
	if (hole.respawn > 0) return;
	for (const object of world.level.objects) {
		if (!canConsumeObject(hole, object)) continue;
		const distance = dist(hole, object);
		if (attract && distance < hole.r * 4.1 * world.rules.attractionScale) pull(world, object, hole, dt);
		if (insideCapture(hole, object)) beginSink(object, hole);
	}
}

export function advanceSinks(world, dt) {
	for (const object of world.level.objects) {
		if (!object.sinkOwner || object.taken) continue;
		const hole = findHole(world, object.sinkOwner);
		if (!hole || hole.respawn > 0) {
			release(object);
			continue;
		}
		object.sink = Math.min(1, object.sink + dt * (1.65 + hole.r * 0.005));
		object.x = mix(object.x, hole.x, dt * (4 + object.sink * 8));
		object.y = mix(object.y, hole.y, dt * (4 + object.sink * 8));
		if (object.sink >= 1) finish(world, hole, object);
	}
}

function pull(world, object, hole, dt) {
	const dx = hole.x - object.x;
	const dy = hole.y - object.y;
	const distance = Math.hypot(dx, dy) || 1;
	const reach = hole.r * 4.1 * world.rules.attractionScale;
	const force = (1 - Math.min(1, distance / reach)) * hole.r * 2.9;
	object.x += dx / distance * force * dt;
	object.y += dy / distance * force * dt;
	object.rot += dt * 4.5;
}

function beginSink(object, hole) {
	object.sinkOwner = hole.id;
	object.sink = Math.max(object.sink, 0.01);
}

function finish(world, hole, object) {
	object.taken = true;
	object.sinkOwner = null;
	const massScale = hole.id === 'player' ? world.rules.captureMass : 1;
	feedHole(hole, object.mass * massScale, object.sparks);
	if (hole.id === 'player') recordPlayerCapture(world, object);
}

function recordPlayerCapture(world, object) {
	world.score += Math.round(object.sparks * world.player.combo * world.rules.scoreScale);
	world.player.combo = Math.min(10, world.player.combo + 0.16);
	world.player.comboT = 3.6;
	world.player.glow = 1;
	world.camera.shake = Math.min(0.32, 0.08 + object.mass * 0.0018);
	world.consumed[object.category] = (world.consumed[object.category] || 0) + 1;
	updateDistrictChain(world, object);
	if (object.power) applyPowerup(world, object.power);
	else world.message = `${object.name} descended. Mass ${Math.round(world.player.mass)}.`;
	addText(world, world.player.x, world.player.y, world.player.z + 30, `+${object.sparks}`);
	world.events.push(['reveal', object.sparks]);
	recordDirectorCapture(world, object);
	recordMechanicCapture(world, object);
}

function updateDistrictChain(world, object) {
	world.districtChain = world.lastDistrict === object.district ? world.districtChain + 1 : 1;
	world.lastDistrict = object.district;
	if (world.districtChain % 10 !== 0) return;
	world.score += 750 * (world.districtChain / 10);
	if (Number.isFinite(world.timeLeft)) world.timeLeft = Math.min(world.level.time + 24, world.timeLeft + 2);
	world.message = `${object.district} district chain ${world.districtChain}: time and sparks multiplied.`;
}

function release(object) {
	object.sinkOwner = null;
	object.sink = 0;
}

function findHole(world, id) {
	return id === 'player' ? world.player : world.rivals.find(rival => rival.id === id);
}
