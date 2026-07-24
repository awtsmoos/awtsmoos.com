//B"H
const http = require("http");
const { json, html, send, readBody } = require("./http.cjs");
const { renderControlPage } = require("./controlPage.cjs");
const { proxyChatGpt } = require("./proxy.cjs");
const { handleRelayApi } = require("./relayApi.cjs");
const { handleDirectApi } = require("./directApi.cjs");
const { cookieSummary } = require("./cookieJar.cjs");
const { log } = require("./logger.cjs");
const { normalizeRouteUrl } = require("./routeNormalize.cjs");
const { recordClientState, clientStateSummary } = require("./clientState.cjs");
const { handleDebugApi } = require("./debugApi.cjs");
const { handleAutomationApi } = require("./automation.cjs");
const { sessionStatus } = require("./authState.cjs");
const { openDebugChrome, statusDebugChrome, saveDebugCookies } = require("./cdpChrome.cjs");

/**
 * The relay names each small gate: proxy, generic fetch, automation, and the new
 * authenticated direct topic vessel. The Awtsmoos reveals one living port after
 * bind, while Awtsmoos.com never routes credentials through public JSON errors.
 */
function startServer(config = {}) {
	const runtime = { host: "127.0.0.1", port: 38488, allowedOrigins: [], ...config };
	const server = http.createServer((req, res) => route(req, res, runtime, server));
	server.listen(runtime.port, runtime.host, () => announce(server, runtime));
	return server;
}

async function route(req, res, config, server) {
	try {
		if (req.method === "OPTIONS") return send(res, 204, "");
		const normalizedUrl = normalizeRouteUrl(req.url);
		const path = new URL(normalizedUrl, publicBase(config, server)).pathname;
		log(config, "route:incoming", {
			method: req.method,
			path,
			url: req.url,
			normalizedUrl
		});
		req.url = normalizedUrl;
		if (path === "/control") return html(res, renderControlPage(publicConfig(config, server)));
		if (path === "/health") return json(res, await health(config, server));
		if (path === "/session-status") return json(res, await sessionStatus(config));
		if (path === "/control-url") return json(res, { ok: true, url: `${publicBase(config, server)}/control` });
		if (path === "/client-state") return await handleClientState(req, res);
		if (path === "/debug-chrome/open") return json(res, await openDebugChrome(config));
		if (path === "/debug-chrome/status") return json(res, await statusDebugChrome(config));
		if (path === "/debug-chrome/save-cookies") return json(res, await saveDebugCookies(config));
		if (path.startsWith("/debug/")) return await handleDebugApi(req, res, config);
		if (path === "/fetch" || path === "/body") return await handleRelayApi(req, res, config);
		if (path.startsWith("/direct-")) return await handleDirectApi(req, res, path);
		if (path.startsWith("/automation-")) return await handleAutomationApi(req, res, config, path);
		if (path === "/chatgpt" || path.startsWith("/chatgpt/") || path === "/proxy") {
			return await proxyChatGpt(req, res, config);
		}
		log(config, "route:fallback-proxy", { path });
		return await proxyChatGpt(req, res, config);
	} catch {
		return json(res, routeError(), 500);
	}
}

async function handleClientState(req, res) {
	if (req.method === "GET") return json(res, clientStateSummary());
	const payload = JSON.parse((await readBody(req)).toString("utf8") || "{}");
	return json(res, { ok: true, event: recordClientState(payload) });
}

async function health(config, server) {
	return {
		ok: true,
		mode: "split-browser",
		controlUrl: `${publicBase(config, server)}/control`,
		chatgptUrl: `${publicBase(config, server)}/chatgpt`,
		directUrl: `${publicBase(config, server)}/direct-chat`,
		targetOrigin: config.targetOrigin,
		allowedOrigins: config.allowedOrigins,
		clientState: clientStateSummary(),
		cookies: cookieSummary(),
		debugChrome: await statusDebugChrome(config),
		session: await sessionStatus(config)
	};
}

function publicConfig(config, server) {
	return { ...config, host: publicHost(config, server), port: publicPort(config, server) };
}

function publicBase(config, server) {
	return `http://${publicHost(config, server)}:${publicPort(config, server)}`;
}

function publicHost(config, server) {
	const address = server?.address?.();
	const host = typeof address === "object" && address?.address ? address.address : config.host;
	return !host || host === "::" || host === "0.0.0.0" ? "127.0.0.1" : host;
}

function publicPort(config, server) {
	const address = server?.address?.();
	return typeof address === "object" && address?.port ? address.port : config.port;
}

function announce(server, config) {
	console.log(`B"H Awtsmoos Split Browser at ${publicBase(config, server)}/control`);
	console.log(`B"H Direct authenticated ChatGPT at ${publicBase(config, server)}/direct-chat`);
}

function routeError() {
	return {
		ok: false,
		status: "relay_route_error",
		error: "relay_route_error",
		safeHint: "The relay route failed before completing the request."
	};
}

module.exports = { startServer };
