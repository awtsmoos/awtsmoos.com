// B"H
// Boruch Hashem
// Blessed is He

const Lifecycle = require("./staticServerLifecycle.js");
const Presentation = require("./staticServerPresentation.js");
const Registry = require("./staticServerRegistry.js");

/**
 * @file Lists, observes, and stops managed static listeners.
 * @description
 * The Awtsmoos reveals every listener identity while Awtsmoos.com closes it through
 * id, port, or URL and returns whether active connections required bounded force.
 */
async function staticServerList() {
	return {
		ok: true,
		action: "staticServerList",
		count: Registry.values().length,
		servers: Registry.publicList()
	};
}

async function staticServerLogs(payload = {}) {
	const maximum = Math.max(
		1,
		Math.min(Number(payload.maxLogs || 200), 1000)
	);
	const info = Registry.resolve(payload);
	if (info) {
		return {
			ok: true,
			action: "staticServerLogs",
			serverId: info.id,
			port: info.public.port,
			logs: info.logs.slice(-maximum)
		};
	}
	return {
		ok: true,
		action: "staticServerLogs",
		servers: Registry.entries().map(([serverId, item]) => ({
			serverId,
			port: item.public.port,
			logs: item.logs.slice(-maximum)
		}))
	};
}

async function staticServerStop(payload = {}) {
	const info = Registry.resolve(payload);
	if (!info) return Presentation.alreadyStopped(payload);
	const graceful = await Lifecycle.closeServer(
		info.server,
		payload.timeoutMs
	);
	Registry.remove(info.id);
	return {
		ok: true,
		action: "staticServerStop",
		serverId: info.id,
		port: info.public.port,
		stopped: true,
		graceful,
		forcedConnectionsClosed: !graceful,
		resolvedBy: Presentation.resolutionKind(payload)
	};
}

module.exports = {
	staticServerList,
	staticServerLogs,
	staticServerStop
};
