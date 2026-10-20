//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module PackedPerfLog
 * @description
 * B"H 2026-10-20 (impl continuation-2): journal instrumentation for the
 * packed read path. The residual feed defect — sub-second responses
 * interleaved with 9–14s stalls under import append load — cannot be
 * apportioned by static reading alone: several caches each claim to
 * absorb appends incrementally, and exactly one of them is lying.
 * This module counts every expensive event WITH its duration so the
 * journal becomes ground truth:
 *
 *   grouped-build    full rebuild of the allPosts grouped map
 *   grouped-merge    tail merge into the grouped map (tail bytes)
 *   grouped-save     grouped snapshot stringify + write (bytes)
 *   grouped-snapload grouped snapshot read + parse from disk (bytes)
 *   list-build       listPackedRecords full latest-per-key build
 *   list-merge       listPackedRecords tail merge (tail bytes)
 *   read-scan        readPacked JSONL full-file scan for one key
 *   latest-fallback  readPackedLatest fell back to a full scan
 *   profile          aggregateProfile section timings (per call)
 *
 * Events at or above EVENT_MS are journaled immediately; everything
 * is also accumulated into counters that flush as one summary line
 * every FLUSH_MS, so cheap events (cache hits) stay visible in
 * aggregate without flooding the journal. Observation only — this
 * module never changes the behavior it measures.
 */

const EVENT_MS = 100;
const FLUSH_MS = 30 * 1000;

/** In-process event counters: kind -> {n, totalMs, maxMs, bytes}. */
const counters = new Map();

/**
 * Records one measured event.
 * @param {string} kind - Event kind (see module doc).
 * @param {number} ms - Duration of the measured operation.
 * @param {object} [fields] - Extra fields (shard, bytes, tailBytes).
 * @returns {void}
 */
function perfEvent(kind, ms, fields = {}) {
	const key = fields.shard ? kind + ':' + fields.shard : kind;
	let c = counters.get(key);
	if (!c) { c = { n: 0, totalMs: 0, maxMs: 0, bytes: 0 }; counters.set(key, c); }
	c.n++;
	c.totalMs += ms;
	if (ms > c.maxMs) c.maxMs = ms;
	if (typeof fields.bytes === 'number') c.bytes += fields.bytes;
	if (ms >= EVENT_MS && typeof console !== 'undefined') {
		console.log('B"H [PERF] ' + kind + ' ms=' + Math.round(ms) +
			(fields.shard ? ' shard=' + fields.shard : '') +
			(typeof fields.bytes === 'number' ? ' bytes=' + fields.bytes : '') +
			(typeof fields.tailBytes === 'number' ? ' tailBytes=' + fields.tailBytes : ''));
	}
}

/**
 * Journals one pre-formatted line immediately (per-request section
 * timings, where the breakdown itself is the evidence).
 * @param {string} line - The full line to journal.
 * @returns {void}
 */
function perfLine(line) {
	if (typeof console !== 'undefined') console.log('B"H [PERF] ' + line);
}

/** Flushes the accumulated counters as one summary line. */
function flushCounters() {
	if (!counters.size) return;
	const parts = [];
	for (const [key, c] of counters) {
		parts.push(key + ' n=' + c.n + ' totalMs=' + Math.round(c.totalMs) +
			' maxMs=' + Math.round(c.maxMs) + (c.bytes ? ' bytes=' + c.bytes : ''));
	}
	counters.clear();
	perfLine('summary ' + parts.join(' | '));
}

const timer = setInterval(flushCounters, FLUSH_MS);
if (timer && typeof timer.unref === 'function') timer.unref();

module.exports = { perfEvent, perfLine };
