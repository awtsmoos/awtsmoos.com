//B"H
//Blessed is He
//Boruch Hashem

/**
 * @file packed/storageAlarms.js
 * @description Dead-space + runaway-growth alarms for the DB shards.
 * The 44 GB disaster grew silently for twelve days: no alarm existed
 * for a shard passing 50% dead, and the series shard grew 8x in one
 * day without tripping anything (db-investigation 02/04). This module
 * turns `storageMetrics` output into alarms:
 *  - DEAD SPACE: a shard whose dead estimate exceeds 50% of logical
 *    bytes is journaled as `[ALARM]` and appended to
 *    `state/alarms.log`.
 *  - VERIFY BROKEN: `verifyState = rejected-persisted-free-list`
 *    (reuse fully disabled) is an alarm the day it happens.
 *  - GROWTH GUARD: shard size history is kept in
 *    `state/shard-size-history.log`; a shard that more than doubles
 *    within 24h raises an alarm and is flagged `growthFrozen` for
 *    review. The flag ALERTS operators only — it never blocks writes.
 * Designed to be called from the 5-minute disk/RAM alarm timer the
 * safeguards program installs; every function is safe to call with
 * partial data and never throws into the caller.
 */

const fs = require('fs');
const path = require('path');
/** Dead fraction above which a shard alarms. */
const DEAD_PCT_LIMIT = 0.5;
/** Growth factor within 24h that trips the growth guard. */
const GROWTH_FACTOR = 2;
/** Window (ms) for the growth comparison. */
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Pure alarm evaluation over metrics + prior size samples.
 * @param {object<string, object>} metrics - collectStorageMetrics output.
 * @param {Array<object>} history - { at, name, bytes } size samples.
 * @param {number} [now] - evaluation time (ms).
 * @returns {Array<object>} Alarm records { kind, shard, detail }.
 */
function evaluateAlarms(metrics, history, now = Date.now()) {
	const alarms = [];
	for (const [name, m] of Object.entries(metrics || {})) {
		if (!m || m.error) continue;
		if (typeof m.deadPct === 'number' && m.deadPct > DEAD_PCT_LIMIT) {
			alarms.push({ kind: 'shard-dead-space', shard: name,
				detail: `${Math.round(m.deadPct * 100)}% dead (${m.deadBytesEstimate} bytes)` });
		}
		if (m.verifyState === 'rejected-persisted-free-list') {
			alarms.push({ kind: 'shard-verify-rejected', shard: name,
				detail: 'free-list reuse is disabled (verify quarantine)' });
		}
		const past = (history || []).filter(
			s => s.name === name && now - s.at >= DAY_MS * 0.9 && now - s.at <= DAY_MS * 1.1);
		const oldest = past.sort((a, b) => a.at - b.at)[0];
		if (oldest && oldest.bytes > 0 && m.physicalBytes > oldest.bytes * GROWTH_FACTOR) {
			alarms.push({ kind: 'shard-growth-frozen', shard: name, growthFrozen: true,
				detail: `grew ${oldest.bytes} -> ${m.physicalBytes} bytes within 24h` });
		}
	}
	return alarms;
}

/**
 * Runs one alarm check: reads size history, appends today's samples,
 * evaluates alarms, journals them, and saves trimmed history.
 * @param {object} opts - { metrics, stateDir } where stateDir holds
 *  `shard-size-history.log` and receives `alarms.log`.
 * @returns {Array<object>} The alarms raised by this run.
 */
function runStorageAlarmCheck(opts = {}) {
	const stateDir = opts.stateDir;
	if (!stateDir || !opts.metrics) return [];
	const historyPath = path.join(stateDir, 'shard-size-history.log');
	let history = [];
	try {
		history = fs.readFileSync(historyPath, 'utf8').split('\n').filter(Boolean)
			.map(line => { const [at, name, bytes] = line.split(' '); return { at: Number(at), name, bytes: Number(bytes) }; })
			.filter(s => Number.isFinite(s.at) && s.name);
	} catch (_) { /* first run — empty history is correct */ }
	const now = Date.now();
	const alarms = evaluateAlarms(opts.metrics, history, now);
	for (const [name, m] of Object.entries(opts.metrics)) {
		if (m && !m.error) history.push({ at: now, name, bytes: Number(m.physicalBytes || 0) });
	}
	try {
		fs.mkdirSync(stateDir, { recursive: true });
		const kept = history.filter(s => now - s.at <= DAY_MS * 2);
		fs.writeFileSync(historyPath, kept.map(s => `${s.at} ${s.name} ${s.bytes}`).join('\n') + '\n');
		for (const alarm of alarms) {
			const line = `${new Date(now).toISOString()} [ALARM] ${alarm.kind} shard=${alarm.shard} ${alarm.detail}`;
			console.error(`B"H ${line}`);
			fs.appendFileSync(path.join(stateDir, 'alarms.log'), line + '\n');
		}
	} catch (_) { /* alarms must never crash the timer */ }
	return alarms;
}

module.exports = { DEAD_PCT_LIMIT, GROWTH_FACTOR, evaluateAlarms, runStorageAlarmCheck };
