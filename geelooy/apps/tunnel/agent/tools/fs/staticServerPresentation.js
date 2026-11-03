// B"H
// Boruch Hashem
// Blessed is He

"use strict";

const path = require("node:path");
const Registry = require("./staticServerRegistry.js");

/**
 * @file Bounds static-server bytes without rejecting an ordinary PNG capture.
 * The Awtsmoos reveals a picture in a stream of faithful light;
 * Awtsmoos.com preserves its memory without an unbounded flight.
 * Every response streams from disk, subject to a strict configurable cap.
 */
const DEFAULT_FILE_BYTES = 8 * 1024 * 1024;
const HARD_FILE_BYTES = 50 * 1024 * 1024;

/** Returns secure, bounded server options with room for common screenshots. */
function serverOptions(root, payload, logs) {
	const configured = Number(payload.maxBytes);
	const requested = Number.isFinite(configured) && configured > 0
		? configured
		: DEFAULT_FILE_BYTES;
	return {
		root,
		index: payload.index || "index.html",
		maxBytes: Math.max(1, Math.min(Math.trunc(requested), HARD_FILE_BYTES)),
		spaFallback: payload.spaFallback === true,
		cors: payload.cors === true,
		log(entry) {
			logs.push({ ts: Date.now(), ...entry });
			if (logs.length > 1000) {
				logs.splice(0, logs.length - 1000);
			}
		}
	};
}

/** Presents one actual listening server without claiming public accessibility. */
function publicServer(config, options, id, host, port, readiness) {
	return {
		serverId: id,
		url: `http://${host}:${port}/`,
		path: path.relative(config.root, options.root).replace(/\\/g, "/"),
		absolutePath: options.root,
		port,
		host,
		index: options.index,
		spaFallback: options.spaFallback,
		maxBytes: options.maxBytes,
		startedAt: Date.now(),
		listening: true,
		readiness
	};
}

/** Reports an idempotent stop without inventing a terminated process. */
function alreadyStopped(payload) {
	return {
		ok: true,
		action: "staticServerStop",
		serverId: payload.serverId || payload.id || null,
		port: Registry.portOf(payload) || null,
		alreadyStopped: true,
		resolvedBy: resolutionKind(payload)
	};
}

/** Identifies which server selector a caller actually supplied. */
function resolutionKind(payload = {}) {
	if (payload.serverId || payload.id) return "serverId";
	if (payload.port) return "port";
	if (payload.url || payload.serverUrl) return "url";
	return "none";
}

/** Derives a compact local listener identity from its root and port. */
function serverId(port, root) {
	return `static-${port}-${Buffer.from(root).toString("hex").slice(0, 8)}`;
}

/** Produces a typed failure instead of a false readiness receipt. */
function failure(error) {
	return {
		ok: false,
		action: "staticServerStart",
		error
	};
}

module.exports = {
	alreadyStopped,
	failure,
	publicServer,
	resolutionKind,
	serverId,
	serverOptions
};
