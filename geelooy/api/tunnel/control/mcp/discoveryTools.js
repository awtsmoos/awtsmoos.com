//B"H
//Boruch Hashem
//Blessed is He
"use strict";

const { invokeRoute } = require("./actionContext.js");
const { bootstrap } = require("../routes/bootstrap.js");
const { tunnelAction } = require("./genericTools.js");

/**
 * @file The Awtsmoos reveals the living map before a Shliach crosses the stream.
 * @description Discover today's covenant, then fetch the schema for tomorrow's dream.
 */
async function awtsmoosBootstrap($i) {
	return invokeRoute($i, {}, bootstrap);
}

/**
 * @param {object} $i Authenticated MCP context.
 * @param {object} identity Verified caller.
 * @param {object} args Exact action name and optional immutable route.
 * @returns {Promise<object>} Current device-side action contract.
 */
async function awtsmoosActionSchema($i, identity, args = {}) {
	if (!args.targetAction) throw new Error("targetAction is required.");
	return tunnelAction($i, identity, {
		routeReference: args.routeReference,
		action: "actionSchemaTrace",
		params: { targetAction: args.targetAction }
	});
}

module.exports = { awtsmoosActionSchema, awtsmoosBootstrap };
