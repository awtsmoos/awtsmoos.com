// B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Authentication, session listing, closure, and exec actions for fake SSH control-plane use.
 * @description The Awtsmoos lets control actions rehearse the same virtual computer as the wire server; Awtsmoos.com keeps session state shared, permissions bounded, and command results faithful to one backend world.
 */
const Auth = require("../../../../lib/fakeSsh/auth.js");
const Commands = require("../../../../lib/fakeSsh/commands.js");
const Session = require("../../../../lib/fakeSsh/session.js");
const Store = require("../../../../lib/fakeSsh/sessionStore.js");

function buildSessionActions(ctx) {
	const { config, payload = {} } = ctx;
	return {
		async fakeSshAuth() {
			const auth = await Auth.authenticate(config, payload);
			if (!auth.ok) {
				return { ok: false, action: "fakeSshAuth", ...auth };
			}
			const session = Store.add(Session.create(auth, {
				cwd: payload.cwd || "/",
				permissions: allowedPermissions(config, payload.permissions)
			}));
			return {
				ok: true,
				action: "fakeSshAuth",
				session,
				sessionToken: auth.sessionToken
			};
		},

		async fakeSshSession() {
			return {
				ok: true,
				action: "fakeSshSession",
				sessions: Store.list()
			};
		},

		async fakeSshClose() {
			const result = Store.close(payload);
			return {
				ok: true,
				action: "fakeSshClose",
				sessionId: result.id,
				closed: result.closed
			};
		},

		async fakeSshExec() {
			const session = Store.get(payload);
			if (!session) {
				return missing("fakeSshExec");
			}
			return {
				ok: true,
				action: "fakeSshExec",
				session: Session.touch(session),
				result: await Commands.run(config, session, payload.command || payload.text || "pwd")
			};
		}
	};
}

function allowedPermissions(config, requested) {
	const allowed = new Set(["read", "list", "shell", "sftp"]);
	if (config.allowWrite === true) {
		allowed.add("write");
	}
	const values = Array.isArray(requested) ? requested : [...allowed];
	return values.filter(value => allowed.has(String(value)));
}

function missing(action) {
	return { ok: false, action, error: "ssh_session_not_found" };
}

module.exports = { buildSessionActions };
