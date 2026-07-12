// B"H

import { PERSISTED_TOP_LEVEL_FIELDS, TRANSIENT_TOP_LEVEL_FIELDS } from './constants.js';
import { toCanonicalData } from './canonicalJson.js';

function isRecord(value) {
	return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function finiteInteger(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) ? Math.round(number) : fallback;
}

function clamp(value, minimum, maximum) {
	return Math.min(maximum, Math.max(minimum, value));
}

function mapDimensions(map) {
	const rows = Array.isArray(map?.baseLayer) ? map.baseLayer : [];
	const height = rows.length;
	const width = Math.max(0, ...rows.map(row => Array.isArray(row) ? row.length : 0));
	return { width, height };
}

function normalizePlayer(player, fallback, map, tileSize, warnings) {
	const merged = { ...fallback, ...(isRecord(player) ? player : {}) };
	for (const field of ['inventory', 'team', 'storage', 'activeQuests', 'completedQuests', 'postedQuests', 'unlockedGates37']) {
		merged[field] = Array.isArray(merged[field]) ? merged[field] : [];
	}
	for (const field of ['flags', 'mapChanges', 'money', 'stats']) {
		merged[field] = isRecord(merged[field]) ? merged[field] : (isRecord(fallback[field]) ? fallback[field] : {});
	}
	const { width, height } = mapDimensions(map);
	const maximumX = Math.max(0, width - 1);
	const maximumY = Math.max(0, height - 1);
	const rawX = finiteInteger(merged.x, fallback.x);
	const rawY = finiteInteger(merged.y, fallback.y);
	merged.x = clamp(rawX, 0, maximumX);
	merged.y = clamp(rawY, 0, maximumY);
	if (rawX !== merged.x || rawY !== merged.y) warnings.push('Player coordinates were clamped inside the current map.');
	merged.pixelX = merged.x * tileSize;
	merged.pixelY = merged.y * tileSize;
	merged.startX = merged.x;
	merged.startY = merged.y;
	merged.targetX = merged.x;
	merged.targetY = merged.y;
	merged.moveStartTime = 0;
	merged.isMoving = false;
	if (!['up', 'down', 'left', 'right'].includes(merged.direction)) merged.direction = fallback.direction;
	return merged;
}

/** Rebuilds trusted runtime state from selected plain progress and fresh defaults. */
export function validateProgress(progress, { createFreshState, maps, tileSize }) {
	if (!isRecord(progress)) throw new Error('Chronicle progress must be an object.');
	const warnings = [];
	const fresh = createFreshState();
	const selected = toCanonicalData(progress);
	const next = { ...fresh };
	for (const field of PERSISTED_TOP_LEVEL_FIELDS) {
		if (field !== 'player' && selected[field] !== undefined) next[field] = selected[field];
	}

	const generatedMaps = isRecord(next.generatedMaps) ? next.generatedMaps : {};
	const requestedMap = typeof next.currentMapId === 'string' ? next.currentMapId : fresh.currentMapId;
	if (!maps[requestedMap] && !generatedMaps[requestedMap]) {
		next.currentMapId = fresh.currentMapId;
		warnings.push(`Unknown map “${requestedMap}” was replaced with the starting map.`);
	}
	const currentMap = maps[next.currentMapId] || generatedMaps[next.currentMapId];
	next.player = normalizePlayer(selected.player, fresh.player, currentMap, tileSize, warnings);
	next.player.currentMapId = next.currentMapId;
	next.bots = Array.isArray(next.bots) ? next.bots : [];
	next.activeGates = isRecord(next.activeGates) ? next.activeGates : {};
	next.stats = { ...(isRecord(fresh.stats) ? fresh.stats : {}), ...(isRecord(next.stats) ? next.stats : {}) };
	next.time = { ...(isRecord(fresh.time) ? fresh.time : {}), ...(isRecord(next.time) ? next.time : {}) };
	next.generatedMaps = generatedMaps;
	next.weather = typeof next.weather === 'string' ? next.weather : fresh.weather;
	next.lightLevel = Number.isFinite(Number(next.lightLevel)) ? Number(next.lightLevel) : fresh.lightLevel;
	next.mode = 'game';
	next.dialogue = { active: false };
	next.battle = { active: false };
	for (const field of TRANSIENT_TOP_LEVEL_FIELDS) {
		if (!['battle', 'db', 'dialogue', 'mode'].includes(field)) delete next[field];
	}
	return { state: next, warnings };
}
