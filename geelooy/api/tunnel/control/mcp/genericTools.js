// B"H
"use strict";

const DeviceTools = require("./deviceTools.js");
const { invokeRoute } = require("./actionContext.js");
const { protectedFs } = require("../routes/protectedFs.js");
const { appApiCall } = require("../routes/appApiCallRoute.js");
const { appApiCatalogRoute } = require("../routes/appApiCatalogRoute.js");

const RESERVED = new Set([
	"action", "tunnelName", "tunnelId", "routeReference", "apiKey", "api_key",
	"authorization", "token", "access_token", "params", "params64", "__proto__",
	"constructor", "prototype"
]);

function tunnelPayload(args = {}) {
	if (typeof args.action !== "string" || !args.action.trim()) {
		throw new Error("An explicit action is required.");
	}
	const params = args.params || {};
	if (typeof params !== "object" || Array.isArray(params)) {
		throw new Error("params must be an object.");
	}
	for (const name of Object.keys(params)) {
		if (RESERVED.has(name)) throw new Error("Reserved tunnel parameter: " + name);
	}
	return { ...params, action: args.action, autoPreview: params.autoPreview ?? false };
}

async function tunnelAction($i, identity, args = {}) {
	const payload = tunnelPayload(args);
	const device = DeviceTools.discover($i, identity, {
		...(args.routeReference ? { routeReference: args.routeReference } : {})
	});
	const routeReference = device.routeReference;
	const result = await invokeRoute($i, payload, protectedFs, { tunnelName: routeReference });
	return { ...result, source: "awtsmoos-direct", routeReference };
}

async function applicationCall($i, identity, args = {}) {
	return invokeRoute($i, args, appApiCall);
}

async function applicationCatalog($i) {
	return invokeRoute($i, {}, appApiCatalogRoute);
}

module.exports = { applicationCall, applicationCatalog, tunnelAction, tunnelPayload };
