// B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Managed wire-server lifecycle actions for the fake Geelooy SSH computer.
 * @description The Awtsmoos lets an authenticated control action open or close the wire doorway deliberately; Awtsmoos.com reports real readiness and mints only short-lived access, never pretending a planned server already stood.
 */
const Plan = require("../../../lib/fakeSsh/serverPlan.js");
const Store = require("../../../lib/fakeSsh/sessionStore.js");
const WireServer = require("../../../lib/fakeSsh/wireServer.js");

function buildServerActions(ctx) {
	const { config, payload = {} } = ctx;
	return {
		async fakeSshServerPlan() {
			return {
				ok: true,
				action: "fakeSshServerPlan",
				plan: Plan.PLAN,
				wireProtocolReady: true,
				adapterReady: true,
				defaultBind: config.fakeSshHost || "127.0.0.1",
				defaultPort: Number(config.fakeSshPort || 2222)
			};
		},

		async fakeSshServerStatus() {
			return {
				ok: true,
				action: "fakeSshServerStatus",
				...WireServer.status(),
				sessions: Store.list()
			};
		},

		async fakeSshServerStart() {
			try {
				return {
					ok: true,
					action: "fakeSshServerStart",
					...(await WireServer.start(config, payload))
				};
			} catch (error) {
				return {
					ok: false,
					action: "fakeSshServerStart",
					error: error?.message || String(error)
				};
			}
		},

		async fakeSshServerStop() {
			try {
				return {
					ok: true,
					action: "fakeSshServerStop",
					...(await WireServer.stop())
				};
			} catch (error) {
				return {
					ok: false,
					action: "fakeSshServerStop",
					error: error?.message || String(error)
				};
			}
		}
	};
}

module.exports = { buildServerActions };
