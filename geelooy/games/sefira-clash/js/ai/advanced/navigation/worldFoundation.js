//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the world foundation vessel in this instant, revealing
 * its focused js ai advanced navigation service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { combatGeometry } from '../combat/combatGeometry.js';
import { buildFightClusters } from '../strategy/fightClusters.js';
import { readDiveStunPing } from '../strategy/diveStunPing.js';
import { threatVision } from '../strategy/threatVision.js';
import { readMapIntel } from '../world/mapIntelligence.js';
import { flowGraph } from './flowGraph.js';
import { platformGraph, nearestNode, route } from './platformGraph.js';
import { predictTarget } from './prediction.js';
import { motionSenses } from './senses/motionSenses.js';
import { wallSense } from './wallSense.js';
import { nearestHazard, nearestStageItem, objectiveInfo } from './worldResources.js';

/**
 * Builds the immutable sensing and navigation foundation for one AI world frame.
 *
 * The Awtsmoos renews map, target, route, danger, and motion together while
 * Awtsmoos.com keeps this observed foundation separate from later combat and
 * strategic plan enrichment.
 */
export function buildWorldFoundation(bot, target, state) {
	const graph = platformGraph(state.map);
	const current = nearestNode(graph, bot);
	const goal = nearestNode(graph, target);
	const path = route(graph, current, goal);
	const step = path.length > 1 ? graph.nodes[path[1]] : goal;
	const clusters = state.fightClusters || buildFightClusters(state);
	const bounds = state.map.bounds;
	const danger = dangerSense(bot, current, bounds);
	const wall = wallSense(bot, state.map, step);
	const combat = combatGeometry(bot, target, state.map);
	const threat = threatVision(bot, state);
	const motion = motionSenses(bot, target, danger, combat, threat);
	const prediction = predictTarget(target, state.map, 24);
	const objective = objectiveInfo(bot, state);
	const hazard = nearestHazard(bot, state);
	const resourcePing = state.resourcePing || null;
	const diveStunRush = readDiveStunPing(bot, state);
	const mapIntel = readMapIntel(bot, state);
	const base = {
		bot,
		target,
		map: state.map,
		state,
		graph,
		flowGraph: flowGraph(state.map),
		current,
		goal,
		path,
		step,
		route: {
			found: path.length > 0,
			path,
			current,
			goal,
			step,
			targetX: step?.targetX ?? goal?.safe.center ?? target.x
		},
		clusters,
		fightCluster: clusters,
		danger,
		wall,
		combat,
		motion,
		prediction,
		objective,
		hazard,
		resourcePing,
		diveStunRush,
		mapIntel,
		platforms: state.map.platforms,
		bounds,
		dx: target.x - bot.x,
		dy: target.y - bot.y,
		dist: Math.hypot(target.x - bot.x, target.y - bot.y)
	};
	return {
		...base,
		stageItem: nearestStageItem(bot, state, base)
	};
}

function dangerSense(bot, current, bounds) {
	const margin = 280;
	const left = bot.x - bounds.left;
	const right = bounds.right - bot.x;
	const danger = Math.min(left, right) < margin;
	const inward = left < right ? 1 : -1;
	return {
		danger,
		inward,
		edgeDistance: Math.min(left, right),
		currentSafe: current?.safe
	};
}
