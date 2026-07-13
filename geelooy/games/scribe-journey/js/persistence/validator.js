// B"H
// Boruch Hashem
// Blessed is He

import { PERSISTED_TOP_LEVEL_FIELDS, TRANSIENT_TOP_LEVEL_FIELDS } from './constants.js';
import { toCanonicalData } from './canonicalJson.js';

function isRecord(value) {
	return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function finiteInteger(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) ? Math.round(number) : fallback;
}

function mapDimensions(map) {
	const rows = Array.isArray(map?.baseLayer) ? map.baseLayer : [];
	return {
		height: rows.length,
		width: Math.max(0, ...rows.map(row => Array.isArray(row) ? row.length : 0))
	};
}

function normalizeQuestCollections(player) {
	player.completedQuests = [...new Set(player.completedQuests.filter(id => typeof id === 'string'))];
	player.rewardedQuests = [...new Set(player.rewardedQuests.filter(id => typeof id === 'string'))];
	player.activeQuests = player.activeQuests.filter(quest => isRecord(quest) && typeof quest.id === 'string');
	for (const quest of player.activeQuests) {
		quest.objectives = Array.isArray(quest.objectives) ? quest.objectives : [];
	}
	if (!player.activeQuests.some(quest => quest.id === player.trackedQuestId)) player.trackedQuestId = null;
}

function normalizePlayer(player, fallback, map, tileSize, warnings) {
	const merged = { ...fallback, ...(isRecord(player) ? player : {}) };
	for (const field of [
		'inventory', 'team', 'storage', 'activeQuests', 'completedQuests',
		'postedQuests', 'unlockedGates37', 'rewardedQuests', 'unlockedRecipes'
	]) {
		merged[field] = Array.isArray(merged[field]) ? merged[field] : [];
	}
	for (const field of [
		'flags', 'mapChanges', 'money', 'stats', 'questChoices',
		'reputation', 'worldChanges'
	]) {
		merged[field] = isRecord(merged[field]) ? merged[field] : (fallback[field] || {});
	}
	merged.trackedQuestId = typeof merged.trackedQuestId === 'string' ? merged.trackedQuestId : null;
	normalizeQuestCollections(merged);
	const { width, height } = mapDimensions(map);
	const rawX = finiteInteger(merged.x, fallback.x);
	const rawY = finiteInteger(merged.y, fallback.y);
	merged.x = Math.min(Math.max(0, width - 1), Math.max(0, rawX));
	merged.y = Math.min(Math.max(0, height - 1), Math.max(0, rawY));
	if (rawX !== merged.x || rawY !== merged.y) warnings.push('Player coordinates were clamped inside the current map.');
	Object.assign(merged, {
		pixelX: merged.x * tileSize,
		pixelY: merged.y * tileSize,
		startX: merged.x,
		startY: merged.y,
		targetX: merged.x,
		targetY: merged.y,
		moveStartTime: 0,
		isMoving: false
	});
	if (!['up', 'down', 'left', 'right'].includes(merged.direction)) merged.direction = fallback.direction;
	return merged;
}

/** Rebuilds trusted runtime state from selected progress and fresh registries. */
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
	const map = maps[next.currentMapId] || generatedMaps[next.currentMapId];
	next.player = normalizePlayer(selected.player, fresh.player, map, tileSize, warnings);
	next.player.currentMapId = next.currentMapId;
	next.bots = Array.isArray(next.bots) ? next.bots : [];
	next.activeGates = isRecord(next.activeGates) ? next.activeGates : {};
	next.stats = { ...fresh.stats, ...(isRecord(next.stats) ? next.stats : {}) };
	next.time = { ...fresh.time, ...(isRecord(next.time) ? next.time : {}) };
	next.generatedMaps = generatedMaps;
	next.weather = typeof next.weather === 'string' ? next.weather : fresh.weather;
	next.lightLevel = Number.isFinite(Number(next.lightLevel)) ? Number(next.lightLevel) : fresh.lightLevel;
	Object.assign(next, { mode: 'game', dialogue: { active: false }, battle: { active: false } });
	for (const field of TRANSIENT_TOP_LEVEL_FIELDS) {
		if (!['battle', 'db', 'dialogue', 'mode'].includes(field)) delete next[field];
	}
	return { state: next, warnings };
}
