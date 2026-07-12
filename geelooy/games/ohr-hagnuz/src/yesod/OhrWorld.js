/**
 * B"H
 * @module OhrWorld
 * @description Portal, facing, and player path behavior over world pathfinding.
 */
import { State } from '../binah/State.js';
import { PathVisualizer } from '../chochmah/PathVisualizer.js';
import { Portals, tileMeta } from '../data/WorldData.js';
import { campaignPortalsFor } from '../data/maps/CampaignPortals.js';
import { currentObjective, recordMissionEvent } from '../missions/MissionRuntime.js';
import { discoverZoneRoute } from './codex/TorahCodexRuntime.js';
import { approachOptions, canPass, findPath, mapSize, metaAt, safeSpawn, tileAt } from './world/WorldPathfinding.js';

export { canPass, findPath, mapSize, metaAt, safeSpawn, tileAt };

const portalsFor = mapId => [
	...(Portals[mapId] || []),
	...campaignPortalsFor(mapId)
];

export const portalAt = (x, y, glyph = tileAt(x, y)) => {
	const meta = tileMeta(glyph);
	const portals = portalsFor(State.MapId);
	if (meta.kind === 'door') {
		return portals.find(portal => portal.x === x && portal.y === y && (!portal.glyph || portal.glyph === glyph));
	}
	if (meta.kind === 'edge') return portals.find(portal => portal.edge === meta.edge);
	return null;
};

export const edgePortal = (x, y) => {
	const size = mapSize();
	const edge = y < 0 ? 'N' : y >= size.h ? 'S' : x < 0 ? 'W' : x >= size.w ? 'E' : null;
	return edge ? portalsFor(State.MapId).find(portal => portal.edge === edge) : null;
};

const recordTravelDelivery = origin => {
	const objective = currentObjective();
	if (origin === 'Jerusalem_Ascent' && objective?.type === 'DELIVER' && objective.target === 'jerusalem_caravan') {
		recordMissionEvent('DELIVER', 'jerusalem_caravan', { mapId: origin });
	}
};

export const transfer = portal => {
	const origin = State.MapId;
	recordTravelDelivery(origin);
	State.MapId = portal.to;
	const spawn = safeSpawn(portal.to, portal.spawn);
	State.resetHero(spawn.x, spawn.y, State.Hero.dir);
	PathVisualizer.clear();
	const zone = discoverZoneRoute(portal.to);
	State.Story.chapter = Math.max(State.Story.chapter || 1, zone.act || 1);
	recordMissionEvent('TRAVEL', portal.to, { mapId: portal.to, origin });
	State.say(`${portal.message || `Entered ${portal.to}.`} Zone: ${zone.name}; ${zone.mood}.`);
};

export const faceTile = (x, y) => {
	const dx = x - State.Hero.cx;
	const dy = y - State.Hero.cy;
	if (Math.abs(dx) + Math.abs(dy) !== 1) return false;
	State.Hero.dir = dx > 0 ? 'r' : dx < 0 ? 'l' : dy > 0 ? 'd' : 'u';
	State.clearPath();
	PathVisualizer.clear();
	return true;
};

const pathToPresence = (x, y) => {
	if (faceTile(x, y)) return [];
	let best = null;
	for (const point of approachOptions(x, y)) {
		const path = findPath(State.Hero.cx, State.Hero.cy, point.x, point.y);
		if (path && (!best || path.length < best.path.length)) best = { ...point, path };
	}
	if (!best) return null;
	State.PathTarget = { x, y, valid: true, faceOnly: true, approach: { x: best.x, y: best.y } };
	return best.path;
};

export const setPathTo = (x, y) => {
	if (State.isUiBlocking()) return null;
	const targetMeta = metaAt(x, y);
	const presence = ['npc', 'musag', 'receiver'].includes(targetMeta.kind);
	const path = presence ? pathToPresence(x, y) : findPath(State.Hero.cx, State.Hero.cy, x, y);
	if (path?.length === 0) {
		State.HeroPath = [];
		if (!presence) State.PathTarget = null;
		PathVisualizer.clear();
		State.say(presence ? `Facing ${targetMeta.label || 'guide'}. Press Talk.` : 'Already standing there.', 120);
		return path;
	}
	if (!presence) State.PathTarget = { x, y, valid: path !== null };
	State.HeroPath = path || [];
	if (path === null) PathVisualizer.showBlocked(x, y);
	State.say(path !== null ? `Walking toward ${targetMeta.label || `${x}, ${y}`}.` : `No open path to ${x}, ${y}.`, 180);
	return path;
};
