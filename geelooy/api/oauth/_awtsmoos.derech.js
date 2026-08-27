// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Dynamic OAuth route vessel for Awtsmoos.com.
 * @description
 * The Awtsmoos is one beyond every URL, while each explicit route carries one
 * appointed service. The root remains a discovery doorway for compatibility,
 * but an unknown named path returns 404 instead of impersonating a valid gate.
 */

const { routeTable } = require("./routes/table.js");

function cleanRouteName(name) {
	return String(name || "")
		.split("?")[0]
		.split("#")[0]
		.replace(/^\/+/, "")
		.replace(/\/+$/, "");
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
			available: Object.keys(routeTable)
		}, null, 2)
	};
}

async function callRoute($i, name, vars) {
	const clean = cleanRouteName(name);
	if (!clean) {
		return routeTable.start($i, vars || {});
	}
	const handler = routeTable[clean];
	if (!handler) {
		return missingRoute(clean);
	}
	return handler($i, vars || {});
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
