//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the sense vessel in this instant, revealing
 * its focused js ai brain service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { combatSense } from '../sense/combatSense.js';
import { stageDangerAt } from '../sense/stageDanger.js';
import { wallSense } from '../sense/wallSense.js';
import { crowdPush } from './crowd.js';
import { edgeSafety } from './edgeSafety.js';
import { hitChance, predictTarget } from './prediction.js';
import { platformBrain } from './platformBrain.js';
import { recoveryRead } from './recoveryRead.js';
import { territorySense } from './territory.js';

/**
 * B"H
 * Bot sensory snapshot with routes, combat lanes, danger, wall blockage, and map.
 *
 * Chapter 269: the unstuck angel must see the lower platforms to know whether
 * to drop or jump. The whole map is now carried into the world-scroll so self
 * preservation can choose earth beneath instead of scraping the ledge forever.
 */
export function senseWorld(bot, target, state) {
	const route = platformBrain(bot, target, state.map.platforms);
	const floor = route.current;
	const predicted = predictTarget(target, 16);
	const dx = predicted.x - bot.x;
	const dy = predicted.y - bot.y;
	const dist = Math.hypot(dx, dy * 0.75);
	const safety = edgeSafety(bot, floor);
	const combat = combatSense(bot, predicted);
	const danger = stageDangerAt(bot.x, bot.y, state.map, floor);
	const targetDanger = stageDangerAt(predicted.x, predicted.y, state.map, route.targetPlatform);
	const wall = wallSense(bot, predicted, state.map);
	return {
		map: state.map,
		platforms: state.map.platforms,
		target,
		predicted,
		floor,
		dx,
		dy,
		dist,
		route,
		combat,
		danger,
		targetDanger,
		wall,
		hitChance: wall.blocked ? 0 : hitChance(bot, predicted, bot.heldWeapon ? 190 : 135),
		crowdPush: crowdPush(bot, state.fighters),
		safety,
		recovery: recoveryRead(target, floor),
		territory: territorySense(bot, target, floor, state.map.platforms),
		edge: edgeInfo(bot, floor),
		weapon: nearestItem(bot, state.weapons, w => !w.held),
		powerup: nearestItem(bot, state.powerups || [], p => p.active),
		whiff:
			!!target.attack &&
			(target.attackFrame || 0) > target.attack.startup + target.attack.active,
		crowded: countNear(bot, state.fighters, 150),
		touching: countNear(bot, state.fighters, 58),
		nav: {
			shouldJump: route.needsJump || combat.aboveLane,
			shouldDrop: route.needsDrop || combat.belowLane,
			targetX: wall.blocked ? wall.escapeX : route.targetX
		}
	};
}

function edgeInfo(bot, p) {
	const left = p.x + 80;
	const right = p.x + p.w - 80;
	return {
		left,
		right,
		center: p.x + p.w / 2,
		off: bot.x < left || bot.x > right || bot.y > p.y + 95
	};
}

function nearestItem(bot, items, ok) {
	let best = null;
	let d = Infinity;
	for (let i = 0; i < items.length; i++) {
		const item = items[i];
		if (!ok(item)) continue;
		const nd = Math.abs(item.x - bot.x) + Math.abs(item.y - bot.y) * 0.65;
		if (nd < d) {
			d = nd;
			best = item;
		}
	}
	return best;
}

function countNear(bot, fighters, radius) {
	let n = 0;
	for (let i = 0; i < fighters.length; i++) {
		const f = fighters[i];
		if (f === bot || f.dead) continue;
		if (Math.abs(f.x - bot.x) < radius && Math.abs(f.y - bot.y) < radius) n++;
	}
	return n;
}
