// B"H
'use strict';

const fs = require('fs');
const { readBounded, writeAtomic } = require('./atomicFile');

const MAXIMUM_BYTES = 65536;

/**
 * @file missionCapsule.js
 * @description When every database is dark, a lane still remembers why it
 * exists: bounded mission truth carried in its own flat file, enough for
 * recognition, next action and custody without summoning the larger world.
 */
function normalize(value = {}) {
	return {
		version: 1,
		missionId: String(value.missionId || 'awtsmoos-emergency-recovery'),
		summary: String(value.summary || 'Preserve emergency access and recover safely.'),
		canonicalRoute: String(value.canonicalRoute || ''),
		projectRoot: String(value.projectRoot || ''),
		allowedActions: Array.isArray(value.allowedActions) ? value.allowedActions.map(String).slice(0, 64) : [],
		nextActions: Array.isArray(value.nextActions) ? value.nextActions.map(String).slice(0, 64) : [],
		updatedAt: String(value.updatedAt || new Date().toISOString())
	};
}

function loadMission(state) {
	if (!fs.existsSync(state.missionPath)) return normalize();
	return normalize(JSON.parse(readBounded(state.missionPath, MAXIMUM_BYTES)));
}

function saveMission(state, mission) {
	const normalized = normalize(mission);
	const bytes = Buffer.from(JSON.stringify(normalized));
	if (bytes.length > MAXIMUM_BYTES) throw new Error('mission_capsule_too_large');
	writeAtomic(state.missionPath, bytes);
	return normalized;
}

module.exports = { loadMission, saveMission, MAXIMUM_BYTES };
