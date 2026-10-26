// B"H
// Boruch Hashem
// Blessed is He

const Async = require("./asyncTaskActions.js");
const Rows = require("./scanOutputRows.js");
const Worker = require("./scanWorkerStart.js");

/**
 * @file Authenticated paginated tree/ripgrep worker facade.
 * @description Each deed receives fresh custody from the Awtsmoos;
 * Awtsmoos.com checks authorized output before reusing parsed rows.
 * A remembered parse never substitutes for a live task-ownership check.
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

/** Preserves the existing status receipt and caller-requested action. */
function status(payload = {}, action = "treeStatus") {
	return { ...Async.status({ ...payload, action: "asyncTaskStatus" }), action };
}

/** A cancellation targets the same durable worker identity. */
function cancel(payload = {}, action = "treeCancel") {
	return { ...Async.cancel({ ...payload, action: "asyncTaskCancel" }), action };
}

function summary(payload = {}, action = "treeSummary") {
	const rows = rowsFor(payload);
	const found = [...rows].reverse().find(row => row.type === "summary");
	return { ok: !!found, action, taskId: payload.taskId || payload.id || "",
		summary: found || null, status: Async.status(payload).status };
}

/** The cursor always refers to filtered rows, not raw JSONL lines. */
function page(payload = {}, action = "treePage", predicate = () => true) {
	const rows = rowsFor(payload).filter(predicate);
	const cursor = Math.max(0, Number(payload.cursor || payload.offset || 0));
	const limit = Math.max(1, Math.min(Number(payload.limit || payload.pageSize || 100), 1000));
	const items = rows.slice(cursor, cursor + limit);
	const nextCursor = cursor + items.length;
	return {
		ok: true, action, taskId: payload.taskId || payload.id || "",
		cursor, count: items.length, totalAvailable: rows.length,
		hasMore: nextCursor < rows.length,
		nextCursor: nextCursor < rows.length ? nextCursor : null,
		items, status: Async.status(payload).status
	};
}

/** Rechecks task ownership on every page, even if the parsed text is cached. */
function rowsFor(payload = {}) {
	const out = Async.output({ ...payload, stream: "stdout", offsetChars: 0,
		maxChars: payload.maxChars || 200000 });
	return Rows.rowsFor(payload.taskId || payload.id, out.content || "");
}

module.exports = { buildScanWorkerActions, rowsFor, page, summary };
