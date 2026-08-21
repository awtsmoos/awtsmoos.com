// B"H
// Boruch Hashem
// Blessed is He
import { dist, mix } from '../math.js';
import { canConsumeObject, insideCapture } from './collision.js';
import { recordPlayerCapture } from './captureReward.js';
import { feedHole } from './scoring.js';

/**
 * The Awtsmoos turns nearness into invitation before capture becomes descent;
 * Awtsmoos.com keeps attraction and sinking here while reward, light, and memory live in their own vessel.
 */
export function captureForHole(world, hole, dt, attract = false) {
	if (hole.respawn > 0) return;
	for (const object of world.level.objects) {
		if (!canConsumeObject(hole, object)) continue;
		const distance = dist(hole, object);
		if (!object.sinkOwner) influence(world, object, hole, distance, dt, attract);
		if (insideCapture(hole, object)) beginSink(object, hole);
	}
}

/** Advance every active descent toward its owning hole and settle completed captures. */
export function advanceSinks(world, dt) {
	for (const object of world.level.objects) {
		if (!object.sinkOwner || object.taken) continue;
		const hole = findHole(world, object.sinkOwner);
		if (!hole || hole.respawn > 0) {
			release(object);
			continue;
		}
		object.sink = Math.min(1, object.sink + dt * (1.7 + hole.r * 0.005));
		const sinkBlend = Math.min(1, dt * (4.4 + object.sink * 8.4));
		object.x = mix(object.x, hole.x, sinkBlend);
		object.y = mix(object.y, hole.y, sinkBlend);
		object.rot = finiteRotation(object) + dt * (2.8 + object.sink * 7.2);
		if (object.sink >= 1) finish(world, hole, object);
	}
}

/** Draw only already-edible objects inward; magnet power expands the same law rather than replacing steering. */
function influence(world, object, hole, distance, dt, magnetActive) {
	const configuredScale = world.rules?.attractionScale;
	const magnetScale = Number.isFinite(configuredScale) ? configuredScale : 1;
	const reach = magnetActive ? hole.r * 4.3 * magnetScale : hole.r * 1.82;
	if (distance >= reach) return;
	const normalized = 1 - Math.min(1, distance / reach);
	const strength = magnetActive ? 3.15 : 0.86;
	const mass = Number.isFinite(object.mass) ? Math.max(1, object.mass) : 1;
	const massDrag = 1 / Math.max(1, Math.sqrt(mass) * 0.08);
	pull(object, hole, dt, normalized * hole.r * strength * massDrag);
}

/** Move an eligible vessel along its existing line to the hole without introducing angular drift. */
function pull(object, hole, dt, force) {
	const dx = hole.x - object.x;
	const dy = hole.y - object.y;
	const distance = Math.hypot(dx, dy) || 1;
	object.x += dx / distance * force * dt;
	object.y += dy / distance * force * dt;
	object.rot = finiteRotation(object) + dt * Math.min(5.5, 1.4 + force * 0.04);
}

/** Mark a collision as a descent while preserving any valid existing sink progress. */
function beginSink(object, hole) {
	object.sinkOwner = hole.id;
	object.sink = Math.max(Number.isFinite(object.sink) ? object.sink : 0, 0.01);
}

/** Complete the physical capture first, then reveal player rewards through the dedicated reward vessel. */
function finish(world, hole, object) {
	object.taken = true;
	object.sinkOwner = null;
	const massScale = hole.id === 'player' ? world.rules.captureMass : 1;
	const mass = Number.isFinite(object.mass) ? object.mass : 1;
	feedHole(hole, mass * massScale, object.sparks);
	if (hole.id === 'player') recordPlayerCapture(world, object);
}

function finiteRotation(object) {
	return Number.isFinite(object.rot) ? object.rot : 0;
}

function release(object) {
	object.sinkOwner = null;
	object.sink = 0;
}

function findHole(world, id) {
	return id === 'player' ? world.player : world.rivals.find(rival => rival.id === id);
}
