// B"H
// Boruch Hashem
// Blessed is He

const fsp = require("node:fs/promises");
const { safePath, assertNotSecret } = require("./pathGuard.js");
const Http = require("./staticServerHttp.js");
const Lifecycle = require("./staticServerLifecycle.js");
const Presentation = require("./staticServerPresentation.js");
const Registry = require("./staticServerRegistry.js");
const Control = require("./staticServerControl.js");

/**
 * @file Starts bounded static servers with immediate readiness proof.
 * @description
 * The Awtsmoos gives each listener a discoverable identity; Awtsmoos.com verifies
 * the port before returning and delegates later observation and closure separately.
 */
async function staticServerStart(config, payload = {}) {
	const root = safePath(config, payload.path || payload.p || ".");
	assertNotSecret(config, root);
	if (!(await fsp.stat(root)).isDirectory()) {
		return Presentation.failure("not_directory");
	}
	const requestedPort = payload.port == null
		? 5180
		: Number(payload.port);
	const host = payload.host === "0.0.0.0"
		? "0.0.0.0"
		: "127.0.0.1";
	const existing = Registry.resolve({
		serverId: payload.serverId,
		port: requestedPort
	});
	if (existing) {
		return {
			ok: true,
			action: "staticServerStart",
			alreadyRunning: true,
			...existing.public
		};
	}
	const logs = [];
	const options = Presentation.serverOptions(root, payload, logs);
	const server = Http.createServer(options);
	await listen(server, requestedPort, host);
	const port = server.address().port;
	const checkHost = host === "0.0.0.0"
		? "127.0.0.1"
		: host;
	const readiness = await Lifecycle.waitForListening(
		checkHost,
		port,
		payload.readinessTimeoutMs
	);
	if (!readiness.ok) {
		await Lifecycle.closeServer(server, 1000);
		return {
			...Presentation.failure("server_not_listening"),
			host,
			port,
			readiness
		};
	}
	const id = payload.serverId || Presentation.serverId(port, root);
	const publicState = Presentation.publicServer(
		config,
		options,
		id,
		host,
		port,
		readiness
	);
	Registry.put(id, {
		id,
		logs,
		public: publicState,
		server
	});
	return {
		ok: true,
		action: "staticServerStart",
		...publicState
	};
}

function listen(server, port, host) {
	return new Promise((resolve, reject) => {
		server.once("error", reject);
		server.listen(port, host, resolve);
	});
}

module.exports = {
	staticServerList: Control.staticServerList,
	staticServerLogs: Control.staticServerLogs,
	staticServerStart,
	staticServerStop: Control.staticServerStop,
	waitForListening: Lifecycle.waitForListening
};
