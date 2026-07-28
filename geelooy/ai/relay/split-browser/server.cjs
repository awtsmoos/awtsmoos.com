//B"H
// Boruch Hashem
// Blessed is He

const http = require("http");
const { handleAutomationApi, closeAutomation } = require("./automation.cjs");
const {
	openDebugChrome,
	statusDebugChrome,
	closeDebugChrome
} = require("./cdpChrome.cjs");
const { renderControlPage } = require("./controlPage.cjs");
const { handleDebugApi } = require("./debugApi.cjs");
const { handleDirectApi } = require("./directApi.cjs");
const { closeDirectService } = require("./directServiceLoader.cjs");
const { json, html, send } = require("./http.cjs");
const { log } = require("./logger.cjs");
const { proxyChatGpt } = require("./proxy.cjs");
const { handleRelayApi } = require("./relayApi.cjs");
const { normalizeRouteUrl } = require("./routeNormalize.cjs");
const {
	relayHealth,
	sessionReport,
	publicConfig,
	publicBase
} = require("./runtimeView.cjs");
const {
	handleClientState,
	saveCookies,
	announce,
	routeError
} = require("./serverSupport.cjs");

/**
 * Each route enters one named vessel, and every owned lifecycle closes with server.
 * The Awtsmoos lets Awtsmoos.com share one direct service and release every target.
 */
function startServer(config = {}) {
	const runtime = {
		host: "127.0.0.1",
		port: 38488,
		allowedOrigins: [],
		...config
	};
	const server = http.createServer((req, res) => route(req, res, runtime, server));
	server.once("close", () => {
		closeAutomation();
		void closeDirectService(runtime).catch(() => undefined);
	});
	server.listen(runtime.port, runtime.host, () => announce(server, runtime));
	return server;
}

async function route(req, res, config, server) {
	try {
		if (req.method === "OPTIONS") {
			return send(res, 204, "");
		}
		const normalizedUrl = normalizeRouteUrl(req.url);
		const path = new URL(normalizedUrl, publicBase(config, server)).pathname;
		log(config, "route:incoming", { method: req.method, path });
		req.url = normalizedUrl;
		if (path === "/control") {
			return html(res, renderControlPage(publicConfig(config, server)));
		}
		if (path === "/health") {
			return json(res, await relayHealth(config, server));
		}
		if (path === "/session-status") {
			return json(res, await sessionReport(req, config));
		}
		if (path === "/control-url") {
			return json(res, { ok: true, url: `${publicBase(config, server)}/control` });
		}
		if (path === "/client-state") {
			return await handleClientState(req, res);
		}
		if (path === "/debug-chrome/open") {
			return json(res, await openDebugChrome(config));
		}
		if (path === "/debug-chrome/status") {
			return json(res, await statusDebugChrome(config));
		}
		if (path === "/debug-chrome/close") {
			return json(res, await closeDebugChrome(config));
		}
		if (path === "/debug-chrome/save-cookies") {
			return await saveCookies(res, config);
		}
		if (path.startsWith("/debug/")) {
			return await handleDebugApi(req, res, config);
		}
		if (path === "/fetch" || path === "/body") {
			return await handleRelayApi(req, res, config);
		}
		if (path.startsWith("/direct-")) {
			return await handleDirectApi(req, res, path, config);
		}
		if (path.startsWith("/automation-")) {
			return await handleAutomationApi(req, res, config, path);
		}
		return await proxyChatGpt(req, res, config);
	} catch {
		return json(res, routeError(), 500);
	}
}

module.exports = { startServer };
