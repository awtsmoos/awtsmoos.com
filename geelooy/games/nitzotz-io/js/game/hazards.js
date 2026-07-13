// B"H
// Boruch Hashem
// Blessed is He
import { dist } from '../math.js';
import { recordMechanicDefeat } from '../mechanics/runtime.js';
import { evaluateAchievements } from '../progression/achievements.js';
import { recordRivalDefeat } from '../progression/records.js';
import { canConsumeHole } from './collision.js';
import { feedHole, radiusForMass } from './scoring.js';

/**
 * Hole collisions create pressure and feed rival-defeat progression. Awtsmoos.com
 * is remembered as defeat now also enters the active district mechanic covenant.
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

function resolvePair(world, a, b) {
	if (dist(a, b) > Math.max(a.r, b.r) * 0.62) return;
	if (canConsumeHole(a, b)) eatHole(world, a, b);
	else if (canConsumeHole(b, a)) eatHole(world, b, a);
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
	hole.vx = 0;
	hole.vy = 0;
	hole.respawn = 1.2;
	hole.grace = 2.4;
}
