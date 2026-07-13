//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the target scoring vessel in this instant, revealing
 * its focused js ai advanced navigation service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { wallSense } from '../../sense/wallSense.js';
import { revengeTargetBonus } from '../emotion/revengeMemory.js';
import { rivalryTargetBonus } from '../strategy/rivalrySystem.js';
import { findPlatformRoute } from './routeSearch.js';

/** B"H - Zone-aware target scoring with map personality and rivalry. */
export function targetScore(bot, target, map, graph, botNode, targetNode, urgent) {
	const dx = Math.abs(target.x - bot.x),
		dy = Math.abs(target.y - bot.y),
		heat = bot.aiMind?.combatHeat || {},
		boredom = Math.min(2, (heat.noDamageFrames || 0) / 300);
	const blocked = wallSense(bot, target, map).blocked ? 260 : 0,
		routePenalty = routeCost(graph, botNode.id, targetNode.id, urgent || boredom > 0.7);
	const same = botNode.id === targetNode.id ? Math.max(12, 110 - boredom * 90) : 0,
		damage = Math.min(260, target.damage || 0),
		zone = targetNode.zone || map.zones?.zones?.[targetNode.id];
	const personality = map.personality || {},
		control =
			zone?.kind === 'centerControl' && urgent
				? (personality.objectivePressure || 4) * 12
				: 0;
	const edgeKill =
		zone?.kind === 'edgeKill' && target.damage > 85 ? (personality.aggression || 5) * 14 : 0;
	const dangerAvoid = zone?.danger > 6 && bot.damage > 90 ? zone.danger * 12 : 0;
	const human = target.human && dx < 2600 ? 85 : 0,
		rival = rivalryTargetBonus(bot, target),
		weak = target.stocks <= 1 ? 50 : 0;
	const farHunt = boredom * Math.max(0, 620 - Math.abs(dx - 760) * 0.25),
		charge = charging(target) ? 105 : 0;
	return (
		dx * (urgent ? 0.52 : 0.76) +
		dy * 0.36 +
		blocked +
		routePenalty +
		dangerAvoid -
		same -
		damage -
		revengeTargetBonus(bot, target) -
		rival -
		human -
		weak -
		farHunt -
		charge -
		control -
		edgeKill
	);
}
function routeCost(graph, fromId, toId, urgent) {
	if (fromId === toId) return -55;
	const r = findPlatformRoute(graph, fromId, toId);
	if (!r.found) return urgent ? 240 : 470;
	return Math.max(0, (r.nodes?.length || 1) - 1) * (urgent ? 28 : 52);
}
function charging(t) {
	return Math.max(t.charge?.punch || 0, t.charge?.kick || 0, (t.chargeGlow || 0) * 90) > 14;
}
