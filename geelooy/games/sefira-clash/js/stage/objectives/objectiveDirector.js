//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the objective director vessel in this instant, revealing
 * its focused js stage objectives service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { setResourcePing } from '../../ai/advanced/strategy/resourcePing.js';

/** B"H - Objective director with pings, claims, and story pressure. */
export function stepObjectiveDirector(state) {
	state.stageDirector ||= {};
	state.stageDirector.objectiveCooldown = Math.max(
		0,
		(state.stageDirector.objectiveCooldown || 420) - 1
	);
	if (!state.objective && state.stageDirector.objectiveCooldown <= 0) spawnObjective(state);
	if (state.objective) stepObjective(state);
}

/**
 * Reveals the draw objective behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} ctx The ctx value entering this behavior.
 * @param {*} objective The objective value entering this behavior.
 */
export function drawObjective(ctx, objective) {
	if (!objective) return;
	const pulse = 0.45 + Math.sin(objective.life * 0.11) * 0.18;
	ctx.save();
	ctx.globalAlpha = pulse;
	ctx.strokeStyle = objective.color;
	ctx.lineWidth = 5;
	ctx.beginPath();
	ctx.arc(objective.x, objective.y, objective.radius, 0, Math.PI * 2);
	ctx.stroke();
	ctx.font = '900 30px serif';
	ctx.textAlign = 'center';
	ctx.fillStyle = '#fff7c4';
	ctx.fillText(objective.letter, objective.x, objective.y + 10);
	ctx.restore();
}

function spawnObjective(state) {
	const p = choosePlatformNearBattle(state),
		center = battleCenter(state),
		x = clamp(center.x, p.x + 70, p.x + p.w - 70);
	state.objective = {
		id: 'captureRune',
		x,
		y: p.y - 70,
		radius: 310,
		life: 960,
		age: 0,
		color: '#fff1a6',
		letter: 'מ',
		holderId: null,
		hold: 0,
		value: 230
	};
	state.stageDirector.objectiveSpawns = (state.stageDirector.objectiveSpawns || 0) + 1;
	state.stageDirector.objectiveCooldown = 1300;
	setResourcePing(state, 'objective', x, state.objective.y, 180);
	state.events.push({
		type: 'narrative',
		x,
		y: state.objective.y - 45,
		text: 'Claim the Rune',
		color: state.objective.color,
		storyBeat: 'objectiveOpen'
	});
}

function stepObjective(state) {
	const o = state.objective;
	o.life--;
	o.age++;
	const holders = holdersInside(state, o);
	if (holders.length) {
		o.holderId = holders[0].id;
		o.hold += Math.min(8, holders.length * 2 + 2);
		if (o.hold >= 16) return claimObjective(state, holders[0]);
	} else o.hold = Math.max(0, o.hold - 1);
	if (o.age > 240) return claimObjective(state, nearestFighter(state, o));
	if (o.life <= 0) state.objective = null;
}

function claimObjective(state, fighter) {
	if (!fighter) {
		state.objective = null;
		return;
	}
	fighter.buffs ||= {};
	fighter.buffs.gevurahFist = Math.max(fighter.buffs.gevurahFist || 0, 420);
	fighter.buffs.netzachBoots = Math.max(fighter.buffs.netzachBoots || 0, 420);
	state.stageDirector.objectiveClaims = (state.stageDirector.objectiveClaims || 0) + 1;
	state.events.push({
		type: 'pickup',
		fighterId: fighter.id,
		actorId: fighter.id,
		human: !!fighter.human,
		x: fighter.x,
		y: fighter.y - 120,
		color: '#fff1a6',
		letter: 'מ',
		damage: 0,
		storyBeat: 'objectiveClaim'
	});
	state.objective = null;
	if (state.resourcePing?.type === 'objective') state.resourcePing = null;
}

function holdersInside(state, o) {
	return state.fighters
		.filter(f => !f.dead && !f.hidden && Math.hypot(f.x - o.x, f.y - 90 - o.y) < o.radius)
		.sort((a, b) => Math.hypot(a.x - o.x, a.y - o.y) - Math.hypot(b.x - o.x, b.y - o.y));
}
function nearestFighter(state, o) {
	return state.fighters
		.filter(f => !f.dead && !f.hidden)
		.sort((a, b) => Math.hypot(a.x - o.x, a.y - o.y) - Math.hypot(b.x - o.x, b.y - o.y))[0];
}
function choosePlatformNearBattle(state) {
	const zones = state.map.zones?.centerControl?.length
		? state.map.zones.centerControl
		: state.map.zones?.landingTrap || [];
	const center = battleCenter(state);
	if (zones.length) return zonePlatform(state.map, nearestZone(zones, center.x));
	const platforms = (state.map.platforms || []).filter(p => p.w > 180);
	if (!platforms.length) return { x: center.x - 200, y: center.y, w: 400 };
	return platforms.sort(
		(a, b) => Math.abs(a.x + a.w / 2 - center.x) - Math.abs(b.x + b.w / 2 - center.x)
	)[0];
}
function nearestZone(zones, x) {
	return [...zones].sort((a, b) => Math.abs(a.x - x) - Math.abs(b.x - x))[0];
}
function zonePlatform(map, zone) {
	return map.platforms[zone.id] || { x: zone.left, y: zone.y, w: zone.right - zone.left };
}
function battleCenter(state) {
	const alive = state.fighters.filter(f => !f.dead && !f.hidden);
	if (!alive.length) return { x: 0, y: 0 };
	return {
		x: alive.reduce((s, f) => s + f.x, 0) / alive.length,
		y: alive.reduce((s, f) => s + f.y, 0) / alive.length
	};
}
function clamp(v, min, max) {
	return Math.max(min, Math.min(max, v));
}
