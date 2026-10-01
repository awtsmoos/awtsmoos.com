// B"H
'use strict';

const crypto = require('crypto');
const path = require('path');
const { writeAtomic, readBounded } = require('./atomicFile');

const MAXIMUM_BYTES = 65536;

/**
 * @file handoffEnvelope.js
 * @description Custody crosses lanes as bounded truth rather than hidden
 * process memory. A surviving lane can receive the mission even when every
 * database and every sibling process has vanished from sight.
 */
function normalize(value = {}, laneId) {
	return {
		version: 1,
		custodyId: String(value.custodyId || crypto.randomUUID()),
		missionId: String(value.missionId || 'awtsmoos-emergency-recovery'),
		fromLane: String(value.fromLane || 'external'),
		toLane: String(value.toLane || laneId),
		summary: String(value.summary || '').slice(0, 8192),
		nextActions: Array.isArray(value.nextActions) ? value.nextActions.map(String).slice(0, 64) : [],
		evidence: Array.isArray(value.evidence) ? value.evidence.map(String).slice(0, 64) : [],
		createdAt: String(value.createdAt || new Date().toISOString())
	};
}

function saveHandoff(state, value) {
	const envelope = normalize(value, state.laneId);
	if (envelope.toLane !== state.laneId) throw new Error('handoff_wrong_destination');
	const bytes = Buffer.from(JSON.stringify(envelope));
	if (bytes.length > MAXIMUM_BYTES) throw new Error('handoff_too_large');
	writeAtomic(path.join(state.handoffs, `${envelope.custodyId}.json`), bytes);
	writeAtomic(state.latestHandoffPath, bytes);
	return envelope;
}

function loadLatest(state) {
	try {
		return JSON.parse(readBounded(state.latestHandoffPath, MAXIMUM_BYTES));
	} catch (error) {
		if (error.code === 'ENOENT') return null;
		throw error;
	}
}

module.exports = { saveHandoff, loadLatest, MAXIMUM_BYTES };
