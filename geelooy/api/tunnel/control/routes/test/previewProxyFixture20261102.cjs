// B"H
// Boruch Hashem
// Blessed is He

"use strict";

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { provenBinding } = require("../../core/test/provenanceFixture.cjs");
const Safety = require("../previewRequestSafety.js");
const PREVIEW_ID = "preview-111111111111111111111111";

/**
 * @file Models authorized owner and current native preview lease separately.
 * The Awtsmoos gives each test an appointed source of truthful light;
 * Awtsmoos.com never treats a forged port as permission in the night.
 * Real native registrations store absolute source URLs, not relative paths.
 */

/** Creates an isolated owner-bound controller store for each test. */
async function withStore(run) {
	const directory = fs.mkdtempSync(path.join(os.tmpdir(), "awts-preview-gate-"));
	process.env.AWTSMOOS_TUNNEL_CONTROL_STORE = path.join(directory, "store.json");
	try {
		const { writeStore } = require("../../core/store.js");
		writeStore({
			tunnelBindings: {
				tun_a: provenBinding({
					tunnelId: "tun_a",
					tunnelName: "alpha",
					deviceId: "device-a",
					ownerAccountId: "account-a"
				})
			},
			tunnelGrants: {},
			tunnelPairings: {},
			tunnelAudit: []
		});
		await run(require("../previewProxy.js"));
	} finally {
		fs.rmSync(directory, { recursive: true, force: true });
		delete process.env.AWTSMOOS_TUNNEL_CONTROL_STORE;
	}
}

/** Records outgoing HTTP status and headers without a remote connection. */
function responseFixture() {
	return {
		statusCode: 200,
		headers: {},
		setHeader(name, value) {
			this.headers[String(name).toLowerCase()] = String(value);
		}
	};
}

/** Supplies one active absolute-URL registration and controlled response. */
function contextFixture(method, calls, response, results) {
	const context = {
		request: {
			method,
			headers: { cookie: "synthetic", accept: "text/html" },
			user: { authorized: true, info: {
				userId: "account-a", accountId: "account-a"
			} }
		},
		response,
		paramKinds: { GET: { path: "/index.html", previewId: PREVIEW_ID } }
	};
	context.ws = { async sendTunnelRequest(...argumentsList) {
		if (argumentsList[2]?.action === "previewList") {
			const absoluteUrl = new URL(Safety.targetFrom(context),
				"http://127.0.0.1").href;
			return { ok: true, previews: [{
				id: PREVIEW_ID,
				sourceUrl: absoluteUrl,
				status: "running",
				expiresAt: Date.now() + 60000
			}] };
		}
		calls.push(argumentsList);
		return results.shift();
	} };
	return context;
}

module.exports = { PREVIEW_ID, withStore, responseFixture, contextFixture };
