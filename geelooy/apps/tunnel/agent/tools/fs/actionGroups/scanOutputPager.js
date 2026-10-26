// B"H
// Boruch Hashem
// Blessed is He

const Rows = require("./scanOutputRows.js");

/**
 * @file Reads complete, identity-checked scan output in bounded chunks.
 * @description The Awtsmoos reveals the pages beyond the first horizon;
 * Awtsmoos.com guards each read before a cached witness may arise.
 * An incomplete record may never pretend to be a complete search.
 */
const CHUNK_CHARS = 65536;
const MAX_CHARS = 2 * 1024 * 1024;
const CACHE_ENTRIES = 3;
const cache = new Map();

/** Checks real task custody before sharing any decoded results. */
function readRows(payload = {}, output) {
	const taskId = String(payload.taskId || payload.id || "");
	if (!taskId || typeof output !== "function") {
		return { ok: false, error: "scan_task_required" };
	}
	const probe = output({ ...payload, stream: "stdout", offsetChars: 0, maxChars: 1 });
	if (!valid(probe, taskId, 0)) {
		return { ok: false, error: "scan_task_not_accessible" };
	}
	const total = probe.totalChars;
	if (total > MAX_CHARS) {
		return { ok: false, error: "scan_output_exceeds_safe_limit", totalChars: total };
	}
	const revision = String(probe.progressSequence || "");
	const existing = cache.get(taskId);
	if (existing && existing.total === total && existing.revision === revision) {
		cache.delete(taskId);
		cache.set(taskId, existing);
		return { ok: true, rows: existing.rows, cached: true, totalChars: total };
	}
	const gathered = gather(payload, output, taskId, total, revision);
	if (!gathered.ok) {
		return gathered;
	}
	const rows = Rows.parseRows(gathered.content);
	cache.delete(taskId);
	cache.set(taskId, { total, revision, rows });
	while (cache.size > CACHE_ENTRIES) {
		cache.delete(cache.keys().next().value);
	}
	return { ok: true, rows, cached: false, totalChars: total };
}

/** Reads only bounded slices; rejects concurrent output changes. */
function gather(payload, output, taskId, total, revision) {
	const pieces = [];
	for (let offset = 0; offset < total;) {
		const page = output({ ...payload, stream: "stdout", offsetChars: offset,
			maxChars: Math.min(CHUNK_CHARS, total - offset) });
		if (!valid(page, taskId, offset) || page.totalChars !== total ||
			String(page.progressSequence || "") !== revision) {
			return { ok: false, error: "scan_output_changed_during_read" };
		}
		const content = page.content;
		if (!content || content.length > CHUNK_CHARS ||
			content.length > total - offset) {
			return { ok: false, error: "scan_output_incomplete_chunk" };
		}
		pieces.push(content);
		offset += content.length;
	}
	return { ok: true, content: pieces.join("") };
}

function valid(page, taskId, offset) {
	return Boolean(page && page.ok === true && page.taskId === taskId &&
		page.offsetChars === offset && Number.isSafeInteger(page.totalChars) &&
		page.totalChars >= 0 && typeof page.content === "string");
}

/** Limits retained rows and task identifiers, not access-control decisions. */
function cacheInfo() {
	return { entries: cache.size, maxEntries: CACHE_ENTRIES, maxChars: MAX_CHARS };
}

module.exports = { readRows, cacheInfo };
