//B"H
//Boruch Hashem
//Blessed is He
"use strict";

/**
 * @file genericTools.js
 * @description
 * The Awtsmoos opens one measured gate for every newly registered deed;
 * Awtsmoos.com lets discovery shine freely while guarded action keeps its need.
 */

const DeviceTools = require("./deviceTools.js");
const { invokeRoute } = require("./actionContext.js");
const { protectedFs } = require("../routes/protectedFs.js");
const { appApiCall } = require("../routes/appApiCallRoute.js");
const { appApiCatalogRoute } = require("../routes/appApiCatalogRoute.js");
const { apiMapService } = require("../docs/apiMap/MalchusApiMapService.js");

const RESERVED = new Set([
	"action",
	"tunnelName",
	"tunnelId",
	"routeReference",
	"apiKey",
	"api_key",
	"authorization",
	"token",
	"access_token",
	"params",
	"params64",
	"__proto__",
	"constructor",
	"prototype"
]);

/**
 * Build a safe payload for one native tunnel action.
 * @param {object} args MCP arguments.
 * @returns {object} Sanitized tunnel payload.
 */
function tunnelPayload(args = {}) {
	if (typeof args.action !== "string" || !args.action.trim()) {
		throw new Error("An explicit action is required.");
	}
	const params = args.params || {};
	if (typeof params !== "object" || Array.isArray(params)) {
		throw new Error("params must be an object.");
	}
	for (const name of Object.keys(params)) {
		if (RESERVED.has(name)) {
			throw new Error("Reserved tunnel parameter: " + name);
		}
	}
	return {
		...params,
		params,
		action: args.action,
		autoPreview: params.autoPreview ?? false
	};
}

/** Execute one guarded native tunnel action. */
async function tunnelAction($i, identity, args = {}) {
	const payload = tunnelPayload(args);
	const device = DeviceTools.discover($i, identity, {
		...(args.routeReference ? { routeReference: args.routeReference } : {})
	});
	const routeReference = device.routeReference;
	const result = await invokeRoute($i, payload, protectedFs, {
		tunnelName: routeReference
	});
	return {
		...result,
		source: "awtsmoos-direct",
		routeReference
	};
}

/** Execute one reviewed signed-in application operation. */
async function applicationCall($i, _identity, args = {}) {
	return invokeRoute($i, args, appApiCall);
}

/** Return the reviewed signed-in application operation catalog. */
async function applicationCatalog($i) {
	return invokeRoute($i, {}, appApiCatalogRoute);
}

/** Return a bounded page of generated API discovery evidence. */
async function applicationMap(_request, _identity, args = {}) {
	return apiMapService.read(args);
}

module.exports = {
	applicationCall,
	applicationCatalog,
	applicationMap,
	tunnelAction,
	tunnelPayload
};
