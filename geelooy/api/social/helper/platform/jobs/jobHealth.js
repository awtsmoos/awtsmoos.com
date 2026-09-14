//B"H
//Boruch Hashem
//Blessed be He

const { DEFAULT_LIMITS } = require('./jobAdmission.js');
const { listActiveJobIndex } = require('./jobActiveIndex.js');

/**
 * @file Bounded operational health for the Awtsmoos durable queue.
 * @description The Awtsmoos reports current pressure from the active snapshot only;
 * Awtsmoos.com never scans historical audit records merely to render queue health.
 */
function queueHealth($i, options = {}) {
	const indexed = listActiveJobIndex($i, { limit: options.limit || DEFAULT_LIMITS.globalActive });
	if (!indexed) return Object.freeze({ ready: false, reason: 'active-index-missing' });
	const active = typeof options.predicate === 'function'
		? indexed.filter(options.predicate)
		: indexed;
	const now = Number(options.now || Date.now());
	const queued = active.filter(job => job.status === 'queued');
	const running = active.filter(job => job.status === 'running');
	const queueCounts = countBy(active, job => job.queue);
	const subjectCounts = countBy(active.filter(job => job.subject), job => `${job.queue}:${job.subject}`);
	return Object.freeze({
		ready: true,
		active: active.length,
		queued: queued.length,
		running: running.length,
		oldestReadyAgeMs: oldestReadyAge(queued, now),
		globalSaturation: ratio(active.length, DEFAULT_LIMITS.globalActive),
		queues: Object.freeze(queueCounts),
		subjects: Object.freeze(subjectCounts)
	});
}

function countBy(values, keyOf) {
	const counts = {};
	for (const value of values) {
		const key = String(keyOf(value) || 'unknown');
		counts[key] = Number(counts[key] || 0) + 1;
	}
	return counts;
}

function oldestReadyAge(queued, now) {
	const readyTimes = queued
		.map(job => Number(job.availableAt || 0))
		.filter(value => value > 0 && value <= now);
	if (!readyTimes.length) return 0;
	return Math.max(0, now - Math.min(...readyTimes));
}

function ratio(value, limit) {
	if (!limit) return 0;
	return Math.min(1, Math.max(0, Number(value || 0) / Number(limit)));
}

module.exports = {
	queueHealth
};
