// B"H
// Boruch Hashem
// Blessed is He

const Async = require("./asyncTaskActions.js");
const Pager = require("./scanOutputPager.js");
const Worker = require("./scanWorkerStart.js");

/**
 * @file Authenticated, complete, bounded tree/ripgrep worker pagination.
 * @description In the Awtsmoos no leaf beyond the first window disappears;
 * Awtsmoos.com reports incomplete custody instead of disguising errors.
 * The same authorized reader checks every observation before cached reuse.
 */
function buildScanWorkerActions(ctx = {}) {
	const { config, payload } = ctx;
	return {
		treeStart: () => Worker.start(config, payload, "tree"),
		treeStatus: () => status(payload, "treeStatus"),
		treePage: () => page(payload, "treePage", row => row.type === "node" || row.type === "skip"),
		treeStream: () => page(payload, "treeStream", () => true),
		treeSummary: () => summary(payload, "treeSummary"),
		treeCancel: () => cancel(payload, "treeCancel"),
		rgStart: () => Worker.start(config, payload, "rg"),
		rgStatus: () => status(payload, "rgStatus"),
		rgPage: () => page(payload, "rgPage", row => row.type === "match" || row.type === "warning"),
		rgStream: () => page(payload, "rgStream", () => true),
		rgSummary: () => summary(payload, "rgSummary"),
		rgCancel: () => cancel(payload, "rgCancel")
	};
}

function status(payload = {}, action = "treeStatus") {
	return { ...Async.status({ ...payload, action: "asyncTaskStatus" }), action };
}

function cancel(payload = {}, action = "treeCancel") {
	return { ...Async.cancel({ ...payload, action: "asyncTaskCancel" }), action };
}

/** Includes the worker's final summary only when output was fully verified. */
function summary(payload = {}, action = "treeSummary") {
	const result = read(payload);
	if (!result.ok) {
		return failed(result, payload, action);
	}
	const found = [...result.rows].reverse().find(row => row.type === "summary");
	return { ok: !!found, action, taskId: taskId(payload),
		summary: found || null, status: Async.status(payload).status };
}

/** Cursor is a filtered row index, not a byte index or truncated prefix. */
function page(payload = {}, action = "treePage", predicate = () => true) {
	const result = read(payload);
	if (!result.ok) {
		return failed(result, payload, action);
	}
	const rows = result.rows.filter(predicate);
	const cursor = Math.max(0, Number(payload.cursor || payload.offset || 0));
	const limit = Math.max(1, Math.min(Number(payload.limit || payload.pageSize || 100), 1000));
	const items = rows.slice(cursor, cursor + limit);
	const nextCursor = cursor + items.length;
	return {
		ok: true, action, taskId: taskId(payload), cursor, count: items.length,
		totalAvailable: rows.length, hasMore: nextCursor < rows.length,
		nextCursor: nextCursor < rows.length ? nextCursor : null,
		items, status: Async.status(payload).status
	};
}

function taskId(payload) {
	return payload.taskId || payload.id || "";
}

function read(payload = {}) {
	return Pager.readRows(payload, value => Async.output(value));
}

function failed(result, payload, action) {
	return { ok: false, action, taskId: taskId(payload), error: result.error,
		totalChars: result.totalChars ?? null };
}

/** Historical export keeps the verified, ordered source-row interface. */
function rowsFor(payload = {}) {
	const result = read(payload);
	if (!result.ok) {
		throw new Error(result.error);
	}
	return result.rows;
}

module.exports = { buildScanWorkerActions, rowsFor, page, summary };
