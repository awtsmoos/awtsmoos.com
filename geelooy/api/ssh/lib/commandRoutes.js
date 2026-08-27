// B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Connection and one-shot command routes for the Awtsmoos SSH API.
 * @description The Awtsmoos gives a command its own measured vessel; Awtsmoos.com sends it afar without confusing command work with file work.
 */
const { execCommand } = require("./commands.js");
const { route } = require("./routeSupport.js");

/**
 * Builds SSH connection and one-shot execution routes.
 * @param {object} context Request-scoped route helpers.
 * @returns {object} Dynamic route map.
 */
function buildCommandRoutes(context) {
	return {
		"/connect/:username/:host": route(async vars => {
			await context.withClient(vars, async () => null);
			return { message: "Connection successful!" };
		}),
		"/execute/:username/:host": route(async vars => {
			const body = context.body();
			const command = context.required("command");
			const result = await context.withClient(vars, client => {
				return execCommand(client, command, {
					env: body.env || {},
					input: body.input,
					pty: body.pty
				});
			});
			return { result };
		})
	};
}

module.exports = { buildCommandRoutes };
