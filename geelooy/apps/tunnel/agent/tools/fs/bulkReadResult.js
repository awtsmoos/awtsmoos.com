// B"H
// Boruch Hashem
// Blessed is He

const { parseLimit, describePage, nextPagePayload } = require("./bulkPage.js");
const { fileSizeMeta } = require("./bulkReadOne.js");

/**
 * @file Preserves legacy ordered bulk-read output and pagination.
 * @description The Awtsmoos joins many readings into a single truthful scroll;
 * Awtsmoos.com preserves each receipt while the ordered pages unroll.
 */
function assembleReceipts(receipts) {
	const files = {};
	const metadata = {};
	const order = [];
	let usedChars = 0;
	let okCount = 0;
	let errorCount = 0;
	for (const receipt of receipts) {
		const name = receipt.spec.path;
		order.push(name);
		if (receipt.error !== undefined) {
			errorCount++;
			files[name] = { ok: false, path: name, error: receipt.error };
			metadata[name] = { ok: false, error: receipt.error };
			continue;
		}
		okCount++;
		usedChars += receipt.size;
		const got = receipt.got;
		files[name] = {
			ok: true, path: name, mode: receipt.spec.mode || "text",
			content: got.content, content64: got.content64,
			truncated: got.truncated, encoding: got.encoding,
			offsetChars: got.offsetChars, nextOffsetChars: got.nextOffsetChars,
			offsetBytes: got.offsetBytes, nextOffsetBytes: got.nextOffsetBytes
		};
		metadata[name] = fileSizeMeta(got);
	}
	return { files, metadata, order, usedChars, okCount, errorCount };
}

/** Returns the same action, page counters, cursors, and next-page shape. */
function bulkResult(config, payload, requested, state, index, receipts, budget) {
	const summary = assembleReceipts(receipts);
	const nextCursor = index < requested.length ? index : null;
	const hasNext = nextCursor !== null;
	const liveState = { ...state, end: nextCursor ?? requested.length, hasNext, nextCursor };
	const limits = {
		maxFiles: state.pageSize,
		maxChars: parseLimit(payload.maxChars, 12000),
		maxBytes: parseLimit(payload.maxBytes, 24000),
		totalMaxBytes: budget,
		maxDepth: payload.maxDepth || payload.depth || 4
	};
	return {
		ok: summary.errorCount === 0, action: "bulk", root: config.root,
		requestedCount: requested.length, returnedCount: summary.order.length,
		okCount: summary.okCount, errorCount: summary.errorCount,
		skippedCount: Math.max(0, requested.length - liveState.end),
		usedChars: summary.usedChars, page: state.page, cursor: state.cursor,
		nextCursor, pageSize: state.pageSize, maxFiles: state.pageSize,
		partial: hasNext,
		stoppedBecause: hasNext ? "page_or_budget_has_more_files" : null,
		message: describePage("bulk read", liveState, limits),
		nextPagePayload: nextPagePayload(payload, "bulk", liveState),
		order: summary.order, metadata: summary.metadata, files: summary.files
	};
}

module.exports = { bulkResult, assembleReceipts };
