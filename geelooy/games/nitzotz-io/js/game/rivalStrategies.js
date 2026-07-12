// B"H
import { dist, norm } from '../math.js';
import { canConsumeObject } from './collision.js';

export const ARCHETYPES = [
	archetype('gatherer', 'Gatherer', 'Prefers nearby low-risk sparks.'),
	archetype('hunter', 'Hunter', 'Pursues smaller holes when advantage appears.'),
	archetype('opportunist', 'Opportunist', 'Steals value near the player route.'),
	archetype('sprinter', 'Sprinter', 'Crosses the city for rich targets.'),
	archetype('architect', 'Architect', 'Favors structures and landmarks.'),
	archetype('trickster', 'Trickster', 'Weaves sideways to bait larger vessels.'),
	archetype('guardian', 'Guardian', 'Orbits the awakened landmark and its seals.')
];

export function archetypeFor(level, index) {
	return ARCHETYPES[(level.seed + index * 3) % ARCHETYPES.length];
}

export function chooseStrategicTarget(world, rival) {
	let best = null;
	let bestScore = -Infinity;
	for (const object of world.level.objects) {
		if (!canConsumeObject(rival, object)) continue;
		const score = targetScore(world, rival, object);
		if (score <= bestScore) continue;
		best = object;
		bestScore = score;
	}
	return best;
}

export function strategicDirection(world, rival, target) {
	if (rival.archetype.id === 'hunter' && canHuntPlayer(world, rival)) {
		return norm({ x: world.player.x - rival.x, y: world.player.y - rival.y });
	}
	if (rival.archetype.id === 'guardian') return guardianDirection(world, rival, target);
	const base = target ? norm({ x: target.x - rival.x, y: target.y - rival.y }) : { x: 0, y: 0 };
	if (rival.archetype.id !== 'trickster') return base;
	const weave = Math.sin(world.director.elapsed * 2.7 + rival.index) * 0.82;
	return norm({ x: base.x - base.y * weave, y: base.y + base.x * weave });
}

export function rivalSpeedScale(rival) {
	return ({ sprinter: 1.28, hunter: 1.1, guardian: 0.93, gatherer: 0.98 })[rival.archetype.id] || 1;
}

function targetScore(world, rival, object) {
	const distance = dist(rival, object) + 20;
	const kind = rival.archetype.id;
	if (kind === 'sprinter') return object.sparks * 2.4 - distance * 0.12;
	if (kind === 'architect') return object.sparks / distance * (['building', 'landmark'].includes(object.category) ? 7 : 0.5);
	if (kind === 'opportunist') return object.sparks / distance * (1 + 300 / (dist(world.player, object) + 80));
	if (kind === 'guardian') return object.sparks / distance * (object.bossAnchor ? 8 : 1);
	return object.sparks / distance;
}

function canHuntPlayer(world, rival) {
	return rival.r > world.player.r * 1.22 && dist(rival, world.player) < rival.r * 12;
}

function guardianDirection(world, rival, target) {
	const boss = world.level.objects.find(object => object.id === world.director.boss.coreId && !object.taken);
	if (!boss) return target ? norm({ x: target.x - rival.x, y: target.y - rival.y }) : { x: 0, y: 0 };
	const toward = norm({ x: boss.x - rival.x, y: boss.y - rival.y });
	return norm({ x: toward.x - toward.y * 0.62, y: toward.y + toward.x * 0.62 });
}

function archetype(id, name, description) {
	return Object.freeze({ id, name, description });
}
