// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");

/** @file Reads bounded action-stream tails and applies cursor/scope filters without loading unbounded history. */
const FILTER_FIELDS = [
	"tunnelName", "deviceName", "projectRoot", "workspaceId", "agentSessionId",
	"logicalAgentId", "conversationId", "missionId", "roomId", "leaseId",
	"workerId", "jobId", "receiptId", "actionId", "controlRequestId",
	"clientRequestId", "traceId", "spanId", "kind"
];

function list(file, query = {}) {
	const rows = readRows(file, query.maxBytes);
	const start = cursorIndex(rows, query.cursor || query.afterEventId);
	const filtered = rows.slice(start).filter(row => matches(row, query));
	const limit = boundedLimit(query.limit);
	const events = filtered.slice(0, limit);
	const nextCursor = events.length ? events[events.length - 1].eventId : String(query.cursor || query.afterEventId || "");
	return { events, nextCursor, hasMore: filtered.length > events.length, scanned: rows.length };
}

function readRows(file, maxBytes) {
	try {
		const stat = fs.statSync(file);
		const size = Math.min(stat.size, boundedBytes(maxBytes));
		const descriptor = fs.openSync(file, "r");
		const buffer = Buffer.alloc(size);
		fs.readSync(descriptor, buffer, 0, size, Math.max(0, stat.size - size));
		fs.closeSync(descriptor);
		return buffer.toString("utf8").split(/\r?\n/).map(parseRow).filter(Boolean);
	} catch {
		return [];
	}
}

function parseRow(line) {
	try { return line.trim() ? JSON.parse(line) : null; } catch { return null; }
}

function cursorIndex(rows, cursor) {
	if (!cursor) return 0;
	const index = rows.findIndex(row => row.eventId === cursor);
	return index < 0 ? 0 : index + 1;
}

function matches(row, query = {}) {
	for (const key of FILTER_FIELDS) {
		if (query[key] && String(row[key] || "") !== String(query[key])) return false;
	}
	if (query.phase && String(row.phase || "") !== String(query.phase)) return false;
	if (query.action && String(row.action || "") !== String(query.action)) return false;
	return true;
}

function boundedLimit(value) {
	const number = Number(value || 100);
	return Math.max(1, Math.min(Number.isFinite(number) ? number : 100, 1000));
}

function boundedBytes(value) {
	const number = Number(value || 5 * 1024 * 1024);
	return Math.max(64 * 1024, Math.min(Number.isFinite(number) ? number : 5 * 1024 * 1024, 50 * 1024 * 1024));
}

module.exports = { list, matches };
