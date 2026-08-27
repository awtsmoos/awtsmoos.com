// B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Persistent interactive SSH shell route family.
 * @description The Awtsmoos carries one remote breath across many HTTP knocks; Awtsmoos.com keeps the PTY alive while credentials fade from the request shore.
 */
const Sessions = require("./shellSessions.js");
const { route } = require("./routeSupport.js");

/**
 * Builds routes for opening, driving, observing, resizing, signaling, and closing a PTY.
 * @param {object} context Request-scoped SSH helpers.
 * @returns {object} Dynamic route map.
 */
function buildShellRoutes(context) {
	return {
		"/session/open/:username/:host": route(async vars => {
			const body = context.body();
			const session = await Sessions.open(context.config(vars), {
				env: body.env || {},
				pty: body.pty === false ? false : (body.pty || {})
			});
			return { session };
		}),
		"/session/input/:sessionId": route(async vars => {
			const session = Sessions.write(vars.sessionId, context.required("data"));
			return { session };
		}),
		"/session/output/:sessionId": route(async vars => {
			return { output: Sessions.poll(vars.sessionId) };
		}),
		"/session/resize/:sessionId": route(async vars => {
			const session = Sessions.resize(vars.sessionId, context.body().size || context.body());
			return { session };
		}),
		"/session/signal/:sessionId": route(async vars => {
			const session = Sessions.signal(vars.sessionId, context.body().signal || "INT");
			return { session };
		}),
		"/session/close/:sessionId": route(async vars => {
			return { session: Sessions.close(vars.sessionId) };
		})
	};
}

module.exports = { buildShellRoutes };
