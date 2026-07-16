// B"H

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-response-identity-"));
process.env.AWTSMOOS_INSTALL_ROOT = root;
fs.writeFileSync(path.join(root, "config.json"), JSON.stringify({
	tunnelName: "awt-public-live-name",
	root
}));

const Envelope = require("../lib/runtime/envelope.js");
const Validation = require(
	"../../../../../ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay/validation.js"
);

try {
	const response = Envelope.responseEnvelope(
		{ id: "transport-stat-1" },
		{
			action: "stat",
			controlRequestId: "req-stat-1",
			path: "repo/package.json",
			projectRoot: root,
			tunnelName: "tun_database_record_id"
		},
		{
			ok: true,
			action: "stat",
			path: path.join(root, "repo/package.json"),
			exists: true
		},
		Date.now(),
		() => ({ inflight: 0, queued: 0 })
	);
	assert.equal(response.tunnelName, "awt-public-live-name");
	assert.equal(response.requestedTunnelName, "awt-public-live-name");
	const checked = Validation.validateTunnelResponse({
		tunnelName: "awt-public-live-name",
		requestedAction: "stat",
		controlRequestId: "req-stat-1",
		projectRoot: root,
		paths: ["repo/package.json"]
	}, response);
	assert.equal(checked.ok, true, JSON.stringify(checked));
	console.log(JSON.stringify({
		ok: true,
		suite: "authoritative-tunnel-response-identity"
	}));
} finally {
	fs.rmSync(root, { recursive: true, force: true });
}
