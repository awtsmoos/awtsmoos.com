//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module ResourceAlarm
 * @description
 * Disk/RAM tripwire (safeguards program, Phase 4, 2026-10-20).
 *
 * WHY THIS EXISTS: the box died quietly more than once — disk at
 * 91% (6.4 GB free) and swap in heavy use while every individual
 * check looked "fine". A safeguard that only answers when asked
 * is not a safeguard. This timer checks every 5 minutes and
 * RAISES on breach: one line in state/alarms.log plus a journal
 * [ALARM] line (console.error) so the condition is visible in
 * `journalctl` without anyone polling.
 *
 * Thresholds: disk free < 8 GB on the data volume, OS free RAM
 * < 150 MB. Checks are two syscalls (statfs + freemem) — cheap
 * enough to be beneath notice. Failures inside a check are
 * swallowed: the alarm must never become the outage.
 */

const fs = require('fs');
const os = require('os');
const { appendLine, stateDir } = require('./safeguardState.js');

/** @constant {string} Alarm log file name in the state dir. */
const ALARMS_LOG = 'alarms.log';
/** @constant {number} Check cadence (5 minutes). */
const INTERVAL_MS = 5 * 60 * 1000;
/** @constant {number} Alarm when data-volume free disk drops below. */
const DISK_FREE_MIN_GB = 8;
/** @constant {number} Alarm when OS free RAM drops below. */
const OS_FREE_MIN_BYTES = 150 * 1024 * 1024;

/** @type {boolean} start() idempotence flag */
let started = false;
/** @type {object|null} interval handle */
let timer = null;

/**
 * Raises one alarm: state log line + journal [ALARM] line.
 * @param {string} kind Alarm kind, e.g. 'DISK_FREE_LOW'.
 * @param {string} detail Human-readable measurement detail.
 * @returns {void}
 */
function raiseAlarm(kind, detail) {
	const line = Date.now() + '\t' + kind + '\t' + detail;
	appendLine(ALARMS_LOG, line);
	console.error('[ALARM] ' + kind + ' ' + detail);
}

/**
 * Free bytes on the data volume holding the safeguards state.
 * @returns {Promise<number>} Free bytes, or -1 when unmeasurable.
 */
async function diskFreeBytes() {
	try {
		const st = await fs.promises.statfs(stateDir());
		return st.bavail * st.bsize;
	} catch (_) {
		return -1;
	}
}

/**
 * Runs one threshold check. Never throws.
 * @returns {Promise<void>}
 */
async function checkOnce() {
	try {
		const freeDisk = await diskFreeBytes();
		if (freeDisk >= 0 && freeDisk < DISK_FREE_MIN_GB * 1024 * 1024 * 1024) {
			raiseAlarm('DISK_FREE_LOW',
				'free=' + (freeDisk / 1073741824).toFixed(2) + 'GB min=' + DISK_FREE_MIN_GB + 'GB');
		}
		const freeRam = os.freemem();
		if (freeRam < OS_FREE_MIN_BYTES) {
			raiseAlarm('OS_FREE_LOW',
				'freeMB=' + Math.round(freeRam / 1048576) + ' minMB=150');
		}
	} catch (_) { /* the alarm must never become the outage */ }
}

/**
 * Starts the 5-minute alarm timer (idempotent, unref'd so it
 * never holds the process open).
 * @returns {boolean} True when this call started the timer.
 */
function startResourceAlarm() {
	if (started) return false;
	started = true;
	timer = setInterval(checkOnce, INTERVAL_MS);
	if (timer && typeof timer.unref === 'function') timer.unref();
	const first = setTimeout(checkOnce, 60 * 1000);
	if (first && typeof first.unref === 'function') first.unref();
	return true;
}

module.exports = {
	ALARMS_LOG,
	INTERVAL_MS,
	DISK_FREE_MIN_GB,
	OS_FREE_MIN_BYTES,
	checkOnce,
	startResourceAlarm,
};
