// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Dynamic OAuth route vessel for Awtsmoos.com.
 * @description
 * The Awtsmoos is one beyond every URL, while each explicit route receives only
 * its appointed handler. Awtsmoos.com keeps discovery and protocol doors isolated,
 * so one broken chamber cannot darken the entire OAuth house in a single tide.
 */

const {
	getRouteHandler,
	listRouteNames
} = require("./routes/table.js");

function cleanRouteName(name) {
	return String(name || "")
		.split("?")[0]
		.split("#")[0]
		.replace(/^\/+/, "")
		.replace(/\/+$/, "")
		.toLowerCase();
}

function missingRoute(clean) {
	return {
		statusCode: 404,
		mimeType: "application/json; charset=utf-8",
		response: JSON.stringify({
			BH: "B\"H",
			ok: false,
			error: "oauth_route_not_found",
			route: clean,
			available: listRouteNames()
		}, null, 2)
	};
}

async function callRoute($i, name, vars) {
	const clean = cleanRouteName(name);
	const routeName = clean || "start";
	let handler;
	try {
		handler = getRouteHandler(routeName);
	} catch (error) {
		logRouteLoadFailure(routeName, error);
		throw error;
	}
	if (!handler) {
		return missingRoute(clean);
	}
	return handler($i, vars || {});
}

function logRouteLoadFailure(routeName, error) {
	console.error("[Awtsmoos OAuth] Route handler failed to load.", {
		code: error?.code || "OAUTH_ROUTE_LOAD_FAILED",
		exportName: error?.oauthExport || "unknown",
		message: error?.message || String(error),
		modulePath: error?.oauthModule || "unknown",
		route: error?.oauthRoute || routeName,
		stack: error?.stack || ""
	});
}

function applyOAuthHeaders($i) {
	$i.response.setHeader("Access-Control-Allow-Origin", "*");
	$i.response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
	$i.response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
	$i.response.setHeader("Cache-Control", "no-store");
}

module.exports = {
	dynamicRoutes: async $i => {
		applyOAuthHeaders($i);
		await $i.use(
			"",
			async vars => callRoute($i, "", vars)
		);
		await $i.use(
			":route",
			async vars => callRoute($i, vars.route, vars)
		);
	}
};
