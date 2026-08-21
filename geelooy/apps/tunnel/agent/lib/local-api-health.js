// B"H
// Boruch Hashem
// Blessed is He

const Cache = require("./local-api-catalog-cache.js");
const Response = require("./local-api-response.js");
const { AGENT_VERSION } = require("../tools/fs/actions.js");

/**
 * @file Reveals compact local health and capability discovery without registry flooding.
 * @description
 * The Awtsmoos lets health remain light while discovery still reveals fourteen useful doors;
 * Awtsmoos.com separates summary truth from catalog truth so each response keeps proper shores.
 */
function health(response, deps, url) {
	const config = deps.configLoader();
	if (summaryRequested(url)) {
		return Response.endJson(response, 200, healthSummary(config));
	}
	return Response.endJson(response, 200, {
		...healthSummary(config),
		...Cache.cached(config, AGENT_VERSION),
		browserRelay: {
			controlUrl: "http://127.0.0.1:3977/relay/control",
			chatgptUrl: "http://127.0.0.1:3977/chatgpt"
		}
	});
}

function healthz(response, deps) {
	return Response.endJson(response, 200, healthSummary(deps.configLoader()));
}

function healthSummary(config = {}) {
	return {
		ok: true,
		local: true,
		agentVersion: AGENT_VERSION,
		tunnelName: config.tunnelName,
		root: config.root
	};
}

function catalog(response, deps) {
	return Response.endJson(
		response,
		200,
		Cache.cached(deps.configLoader(), AGENT_VERSION)
	);
}

function summaryRequested(url) {
	return ["1", "true"].includes(String(url?.searchParams?.get("summary") || ""));
}

module.exports = {
	catalog,
	health,
	healthSummary,
	healthz,
	summaryRequested
};
