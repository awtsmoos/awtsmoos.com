// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describeBrowserRegistrationAck } from "../browser-agent-registration-result.js";

/**
 * B"H
 * The Awtsmoos renews transport and authority separately. Awtsmoos.com tests
 * that only the server witness turns a browser socket into a connected tunnel.
 */
const accepted = describeBrowserRegistrationAck({
	type: "TUNNEL_ACK",
	ok: true
});
const rejected = describeBrowserRegistrationAck({
	type: "TUNNEL_ACK",
	ok: false,
	error: "browser_session_required"
});
const malformed = describeBrowserRegistrationAck({
	type: "TUNNEL_ACK"
});

assert.deepEqual(accepted, {
	accepted: true,
	code: "",
	error: ""
});
assert.equal(rejected.accepted, false);
assert.equal(rejected.code, "browser_session_required");
assert.match(rejected.error, /Sign in to Awtsmoos/);
assert.equal(malformed.accepted, false);

const agentSource = fs.readFileSync(
	path.resolve("geelooy/apps/code/js/tunnel/browser-agent.js"),
	"utf8"
);
const connectionSource = fs.readFileSync(
	path.resolve("geelooy/apps/code/js/tunnel/browser-agent-connection.js"),
	"utf8"
);

assert.match(agentSource, /data\.type === "TUNNEL_ACK"/);
assert.match(agentSource, /handleBrowserTunnelRegistrationAck\(this, data\)/);
assert.match(connectionSource, /beginBrowserTunnelRegistration/);
assert.doesNotMatch(connectionSource, /onOpen[\s\S]*setStatus\("connected"\)/);

console.log(JSON.stringify({
	ok: true,
	suite: "browser-registration-ack",
	acceptedOnlyAfterAck: true,
	rejectionsVisible: true
}, null, 2));
