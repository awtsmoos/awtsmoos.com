// B"H
import { clamp, heightAt, TAU } from '../math.js';

/** Walkers wander cheaply, then surrender completely to the shared sink animation. */
export function updatePedestrians(world, dt) {
	const scale = world.rules.pedestrianSpeed;
	if (!scale) return;
	const limit = world.level.bounds - 70;
	for (const object of world.level.objects) {
		if (!object.pedestrian || object.taken || object.sinkOwner) continue;
		moveWalker(world, object, dt * scale, limit);
	}
}

function moveWalker(world, walker, dt, limit) {
	walker.turnTimer -= dt;
	if (walker.turnTimer <= 0) {
		walker.walkAngle += Math.sin(world.director.elapsed * 0.7 + walker.walkSeed) * 1.8;
		walker.turnTimer = 0.8 + Math.abs(Math.sin(walker.walkSeed + world.director.elapsed)) * 1.8;
	}
	avoidPlayer(world, walker, dt);
	walker.x = clamp(walker.x + Math.cos(walker.walkAngle) * walker.speed * dt, -limit, limit);
	walker.y = clamp(walker.y + Math.sin(walker.walkAngle) * walker.speed * dt, -limit, limit);
	if (Math.abs(walker.x) >= limit || Math.abs(walker.y) >= limit) walker.walkAngle += Math.PI;
	walker.walkAngle %= TAU;
	walker.rot = -walker.walkAngle;
	walker.z = heightAt(walker.x, walker.y, world.level.index);
}

function avoidPlayer(world, walker, dt) {
	const dx = walker.x - world.player.x;
	const dy = walker.y - world.player.y;
	const distance = Math.hypot(dx, dy);
	if (distance > world.player.r * 4 || !distance) return;
	const urgency = 1 - distance / (world.player.r * 4);
	walker.walkAngle += Math.sign(Math.sin(walker.walkSeed)) * urgency * dt * 4;
}
