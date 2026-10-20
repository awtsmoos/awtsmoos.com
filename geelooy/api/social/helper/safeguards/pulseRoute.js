//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module PulseRoute
 * @description
 * Builds the payload for GET /api/social/health/pulse
 * (safeguards program, Phase 4, 2026-10-20): one cheap, honest
 * health snapshot — event-loop lag p95, heap in use, OS free
 * RAM, data-volume free disk, full scans in the last hour, and
 * process uptime. Every sensor already exists (loop monitor,
 * full-scan counter); this module only reads them. No sensor
 * failure may fail the endpoint: a degraded field reads -1.
 *
 * Also lazily starts the resource alarm timer on first pulse,
 * so the tripwire is armed even if boot wiring is missed.
 */

const fs = require('fs');
const os = require('os');
const { loopLagP95 } = require('../routes/packed/eventLoopMonitor.js');
const { fullScansLastHour } = require('./fullscanWatch.js');
const { stateDir } = require('./safeguardState.js');
const { startResourceAlarm } = require('./resourceAlarm.js');

/**
 * Free gigabytes on the data volume (state dir's filesystem).
 * @returns {Promise<number>} GB with 2 decimals, or -1.
 */
async function diskFreeGB() {
	try {
		const st = await fs.promises.statfs(stateDir());
		return Math.round(((st.bavail * st.bsize) / 1073741824) * 100) / 100;
	} catch (_) {
		return -1;
	}
}

/**
 * Safe numeric sensor read: -1 on any failure.
 * @param {Function} read Sensor thunk.
 * @returns {number} Sensor value or -1.
 */
function safeNumber(read) {
	try {
		const value = Number(read());
		return Number.isFinite(value) ? value : -1;
	} catch (_) {
		return -1;
	}
}

/**
 * Builds the pulse payload. Never throws.
 * @returns {Promise<object>} The pulse metrics object.
 */
async function pulsePayload() {
	startResourceAlarm();
	let scans = -1;
	try {
		scans = await fullScansLastHour();
	} catch (_) { /* degraded field */ }
	return {
		loopLagP95: safeNumber(() => Math.round(loopLagP95())),
		heapMB: safeNumber(() => Math.round(process.memoryUsage().heapUsed / 1048576)),
		osFreeMB: safeNumber(() => Math.round(os.freemem() / 1048576)),
		diskFreeGB: await diskFreeGB(),
		fullScansLastHour: scans,
		uptimeSec: safeNumber(() => Math.round(process.uptime())),
	};
}

module.exports = { pulsePayload, diskFreeGB };
