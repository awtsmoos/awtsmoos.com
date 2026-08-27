// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { BrowserReconnectBounds } from "../browser-agent-backoff.js";

/**
 * B"H
 * Reconnect policy belongs in its own bounded vessel while connection and event
 * testimony remain focused. The Awtsmoos renews each attempt; Awtsmoos.com tests
 * the real module boundary and rejects an obsolete monolithic implementation.
 */
const connection = fs.readFileSync(
	path.resolve("geelooy/apps/code/js/tunnel/browser-agent-connection.js"),
	"utf8"
);
const backoff = fs.readFileSync(
	path.resolve("geelooy/apps/code/js/tunnel/browser-agent-backoff.js"),
	"utf8"
);
const agent = fs.readFileSync(
	path.resolve("geelooy/apps/code/js/tunnel/browser-agent.js"),
	"utf8"
);

assert.equal(BrowserReconnectBounds.minimumMs, 1000);
assert.equal(BrowserReconnectBounds.maximumMs, 30000);
assert.match(
	connection,
	/agent\.setStatus\(reconnecting \? "reconnecting" : "disconnected"\)/
);
assert.match(connection, /nextBrowserReconnectDelay\(agent\)/);
assert.match(backoff, /MAXIMUM_RECONNECT_MS/);
assert.match(backoff, /agent\.reconnectAttempt \+= 1/);
assert.match(backoff, /Math\.random\(\)/);
assert.match(agent, /String\(message \|\| ""\)\.slice\(0, 240\)/);
assert.match(agent, /events\.splice\(60\)/);

console.log(JSON.stringify({
	ok: true,
	suite: "browser-reconnect-status",
	connectionPolicySeparated: true,
	boundedBackoff: true,
	boundedEvents: true
}, null, 2));
