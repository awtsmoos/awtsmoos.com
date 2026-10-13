// B"H
// Boruch Hashem
// Blessed is He
import { dist, heightAt } from '../math.js';
import { recordMechanicDefeat } from '../mechanics/runtime.js';
import { evaluateAchievements } from '../progression/achievements.js';
import { recordRivalDefeat } from '../progression/records.js';
import {
	blockConsumeWithArmor,
	resolveImpact
} from './combat.js';
import { canConsumeHole } from './collision.js';
import { feedHole, radiusForMass } from './scoring.js';

/**
 * Hole collisions now reveal armor and impact before the existing decisive swallow.
 * Every pair remains bounded, deterministic, and free from projectile simulation.
 */
export function resolveHazards(world, dt) {
	world.danger.cooldown = Math.max(0, world.danger.cooldown - dt);
	const holes = [world.player, ...world.rivals];
	for (let left = 0; left < holes.length; left += 1) {
		for (let right = left + 1; right < holes.length; right += 1) {
			resolvePair(world, holes[left], holes[right]);
		}
	}
}

function resolvePair(world, first, second) {
	if (first.respawn > 0 || second.respawn > 0) return;
	if (first.grace > 0 || second.grace > 0) return;
	if (dist(first, second) > Math.max(first.r, second.r) * 0.62) return;
	if (canConsumeHole(first, second)) {
		if (!blockConsumeWithArmor(world, first, second)) eatHole(world, first, second);
		return;
	}
	if (canConsumeHole(second, first)) {
		if (!blockConsumeWithArmor(world, second, first)) eatHole(world, second, first);
		return;
	}
	resolveImpact(world, first, second);
}

function eatHole(world, big, small) {
	if (small.respawn > 0) return;
	feedHole(big, small.mass * 0.36, Math.round(small.mass * 9));
	if (big.id === 'player' && small.id !== 'player') {
		recordRivalDefeat(world);
		world.message = `${small.name} the ${small.archetype.name} descended into your vessel.`;
		evaluateAchievements(world);
	}
	if (small.id === 'player') {
		world.score = Math.max(0, world.score - Math.round(small.mass * 12));
		world.danger.hits += 1;
		world.message = `${big.name} swallowed your vessel. Re-forming...`;
		world.events.push(['hazard', small.mass]);
		recordMechanicDefeat(world);
	}
	respawn(world, small);
}

function respawn(world, hole) {
	const baseMass = hole.id === 'player' ? 25 : 20 + (hole.index || 0) * 1.4;
	hole.mass = Math.max(baseMass, hole.mass * 0.48);
	hole.r = radiusForMass(hole.mass);
	const angle = world.director.elapsed * 0.37 + (hole.index || 0) * 1.7;
	hole.x = Math.cos(angle) * world.level.bounds * 0.24;
	hole.y = Math.sin(angle) * world.level.bounds * 0.24;
	// B"H — Yaakov 2026-10-13: snap z at re-form time too; the old code left
	// a stale height, so the player could reappear underground.
	const levelIndex = Number.isFinite(world.level?.index) ? world.level.index : 0;
	const ground = heightAt(hole.x, hole.y, levelIndex);
	hole.z = Number.isFinite(ground) ? ground : 0;
	hole.vx = 0;
	hole.vy = 0;
	hole.respawn = 1.2;
	hole.grace = 2.4;
	hole.hitCooldown = 0;
	hole.stun = 0;
}
