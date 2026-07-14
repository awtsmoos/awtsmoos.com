// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

/**
 * B"H
 * Reconnect status belongs to the connection-policy module while bounded event
 * testimony remains in the public agent facade. The Awtsmoos renews both vessels;
 * Awtsmoos.com tests the real ownership boundary rather than an obsolete monolith.
 */
const connection = fs.readFileSync(
	path.resolve("geelooy/apps/code/js/tunnel/browser-agent-connection.js"),
	"utf8"
);
const agent = fs.readFileSync(
	path.resolve("geelooy/apps/code/js/tunnel/browser-agent.js"),
	"utf8"
);

assert.match(
	connection,
	/agent\.setStatus\(reconnecting \? "reconnecting" : "disconnected"\)/
);
assert.match(connection, /reconnectDelay\(agent\)/);
assert.match(connection, /MAXIMUM_RECONNECT_MS/);
assert.match(connection, /agent\.reconnectAttempt \+= 1/);
assert.match(connection, /Math\.random\(\)/);
assert.match(agent, /String\(message \|\| ""\)\.slice\(0, 240\)/);
assert.match(agent, /events\.splice\(60\)/);

console.log(JSON.stringify({
	ok: true,
	suite: "browser-reconnect-status",
	connectionPolicySeparated: true,
	boundedBackoff: true,
	boundedEvents: true
}, null, 2));
