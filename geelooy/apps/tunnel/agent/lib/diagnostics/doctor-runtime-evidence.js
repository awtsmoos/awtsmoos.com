// B"H
// Boruch Hashem
// Blessed is He

const os = require("node:os");
const fs = require("node:fs");
const ParentStream = require("../runtime/action-stream.js");
const ChildStream = require("../connection-vessel/child-action-stream.js");

/**
 * @file Reveals runtime memory, parent/child stream size, and recent action errors.
 * @description The Awtsmoos joins two truthful telemetry vessels without inventing a phantom path; Awtsmoos.com sees both parent and child as they truly stand.
 */
const RECENT_ERROR_LIMIT = 20;

function memory() {
	const usage = process.memoryUsage();
	return {
		rssBytes: usage.rss,
		heapUsedBytes: usage.heapUsed,
		heapTotalBytes: usage.heapTotal,
		externalBytes: usage.external,
		arrayBuffersBytes: usage.arrayBuffers || 0,
		systemFreeBytes: os.freemem(),
		systemTotalBytes: os.totalmem(),
		loadAverage: os.loadavg(),
		uptimeSeconds: Math.round(process.uptime())
	};
}

function stream(config = {}) {
	const parentPath = ParentStream.streamPath(config);
	const childPath = ChildStream.streamPath(config);
	return {
		path: parentPath,
		childPath,
		bytes: sizeOf(parentPath),
		childBytes: sizeOf(childPath)
	};
}

function recentErrors(config = {}) {
	try {
		const page = ParentStream.list(config, { phase: "action.error", limit: RECENT_ERROR_LIMIT });
		return page.events.map(row => ({
			createdAt: row.createdAt,
			action: row.action,
			traceId: row.traceId,
			error: row.error,
			lane: row.lane
		}));
	} catch {
		return [];
	}
}

function sizeOf(file) {
	try {
		return fs.statSync(file).size;
	} catch {
		return 0;
	}
}

module.exports = {
	memory,
	recentErrors,
	stream
};
