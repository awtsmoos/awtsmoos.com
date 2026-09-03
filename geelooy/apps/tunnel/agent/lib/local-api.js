// B"H
// Boruch Hashem
// Blessed is He

const http = require("node:http");
const { URL } = require("node:url");
const { loadConfig } = require("./config.js");
const Catalog = require("./local-api-catalog.js");
const PortPolicy = require("./local-api-port-policy.js");
const Response = require("./local-api-response.js");
const Routes = require("./local-api-routes.js");
const { handleLocalBrowserRelay } = require("./local-browser-relay.js");
const { handleFs } = require("../tools/fs/index.js");
const { handleCommand } = require("../tools/command/index.js");
const { handleChrome } = require("../tools/chrome/index.js");
const { handleRelay, jsonRelay } = require("../tools/relay/index.js");
const { handleStreaming } = require("../tools/streaming/index.js");

const DEFAULT_HOST = "127.0.0.1";
const DEFAULT_PORT = 3977;
const LISTEN_BACKLOG = 4096;

/**
 * @file Hosts the local tunnel API while honoring exact candidate port custody.
 * @description
 * The Awtsmoos lets ordinary service find a neighboring gate when a doorway is filled;
 * Awtsmoos.com keeps installer candidates on the exact promised port, so readiness truth is never willed.
 */
function createLocalApiServer(dependencies = {}) {
	return http.createServer((request, response) => {
		return route(request, response, makeDeps(dependencies));
	});
}

/** Starts the local API and fails fast when an explicitly assigned port is unavailable. */
function startLocalApiServer(options = {}) {
	const log = options.log || (() => {});
	const config = (options.configLoader || loadConfig)();
	const settings = localSettings(config);
	if (!settings.enabled) return null;
	const server = createLocalApiServer(options);
	let port = settings.port;
	let attempts = 0;
	configureServer(server, log);
	server.on("error", error => {
		if (PortPolicy.mayRetry(error, settings.fixedPort, attempts)) {
			attempts += 1;
			port = PortPolicy.next(port);
			return server.listen(port, settings.host, LISTEN_BACKLOG);
		}
		if (error.code === "EADDRINUSE" && settings.fixedPort) {
			log("Local tunnel API fixed port unavailable:", port);
			return PortPolicy.failFixedPort(error, port, options.fatalListenError);
		}
		log("Local tunnel API error:", error.message);
	});
	server.listen(port, settings.host, LISTEN_BACKLOG, () => {
		server.awtsmoosLocalUrl = `http://${settings.host}:${port}`;
		log("Local tunnel API:", server.awtsmoosLocalUrl);
		log("Local ChatGPT browser relay:", `${server.awtsmoosLocalUrl}/relay/control`);
	});
	return server;
}

/** Applies long-lived local request timings without coupling route behavior to transport policy. */
function configureServer(server, log) {
	server.keepAliveTimeout = 65000;
	server.headersTimeout = 70000;
	server.requestTimeout = 0;
	server.maxRequestsPerSocket = 0;
	server.on("clientError", error => {
		log("Local tunnel API client error:", error.code || error.message);
	});
}

/** Resolves the handlers injected into the compact route catalog. */
function makeDeps(dependencies = {}) {
	return {
		configLoader: dependencies.configLoader || loadConfig,
		fsHandler: dependencies.fsHandler || ((payload, socket) => handleFs(payload, socket)),
		commandHandler: dependencies.commandHandler || (payload => handleCommand(payload)),
		chromeHandler: dependencies.chromeHandler || (payload => handleChrome(payload)),
		relayHandler: dependencies.relayHandler || ((payload, config) => handleRelay(payload, config)),
		streamingHandler: dependencies.streamingHandler || (payload => handleStreaming(payload)),
		jsonRelayHandler: dependencies.jsonRelayHandler || (payload => jsonRelay(payload))
	};
}

/** Returns local API settings and records whether the environment fixed the port exactly. */
function localSettings(config = {}) {
	const localApi = config.localApi || {};
	return {
		enabled: process.env.AWTSMOOS_LOCAL_API !== "0" && localApi.enabled !== false,
		host: process.env.AWTSMOOS_LOCAL_API_HOST || localApi.host || DEFAULT_HOST,
		port: Response.bounded(process.env.AWTSMOOS_LOCAL_API_PORT || localApi.port, DEFAULT_PORT),
		fixedPort: PortPolicy.isFixed()
	};
}

/** Routes one local request through CORS, browser relay, GET, or POST handlers. */
async function route(request, response, deps) {
	Response.setCors(response);
	if (request.method === "OPTIONS") return Response.endJson(response, 204, {});
	try {
		const url = new URL(request.url || "/", "http://127.0.0.1");
		if (await handleLocalBrowserRelay(request, response, deps, url)) return;
		if (request.method === "GET") return await Routes.get(response, deps, url);
		if (request.method === "POST") return await Routes.post(request, response, deps, url);
		return Response.endJson(response, 404, { ok: false, error: "unknown_local_api_route" });
	} catch (error) {
		return Response.endJson(response, 500, { ok: false, error: error.message, code: error.code || "local_api_error" });
	}
}

module.exports = { createLocalApiServer, localSettings, makeCatalog: Catalog.makeCatalog, makeDeps, startLocalApiServer };
