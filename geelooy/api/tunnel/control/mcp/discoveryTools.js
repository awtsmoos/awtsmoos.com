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
	if (!args.targetAction && !args.targetActions) throw new Error("targetAction or targetActions is required.");
	if (args.targetActions !== undefined && (!Array.isArray(args.targetActions) || !args.targetActions.length || args.targetActions.length > 16 || args.targetActions.some(name => typeof name !== "string" || !name.trim() || name.length > 128))) throw new Error("targetActions must contain 1–16 exact action names.");
	return tunnelAction($i, identity, {
		routeReference: args.routeReference,
		action: "actionSchemaTrace",
		params: args.targetActions ? { targetActions: args.targetActions } : { targetAction: args.targetAction }
	});
}

module.exports = { awtsmoosActionSchema, awtsmoosBootstrap };
