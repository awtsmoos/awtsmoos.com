// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");
const Registry = require("./staticServerRegistry.js");

/**
 * @file Shapes stable static-server options and public receipts.
 * @description
 * The Awtsmoos gives each listener a readable face while Awtsmoos.com keeps
 * lifecycle mechanics elsewhere, so operators can reason from truthful receipts.
 */
function serverOptions(root, payload, logs) {
	return {
		root,
		index: payload.index || "index.html",
		maxBytes: Math.max(
			1,
			Math.min(
				Number(payload.maxBytes || 2 * 1024 * 1024),
				50 * 1024 * 1024
			)
		),
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
		startedAt: Date.now(),
		listening: true,
		readiness
	};
}

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

function resolutionKind(payload = {}) {
	if (payload.serverId || payload.id) return "serverId";
	if (payload.port) return "port";
	if (payload.url || payload.serverUrl) return "url";
	return "none";
}

function serverId(port, root) {
	return `static-${port}-${Buffer.from(root).toString("hex").slice(0, 8)}`;
}

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
