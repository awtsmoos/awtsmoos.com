//B"H
"use strict";
// Route-layer test: roomBridge is called by the REAL agent-room route,
// behind existing auth, and a replayed bridge call dedupes via
// clientMessageId. Uses the isolated test store env override only.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "awt-room-route-"));
process.env.AWTSMOOS_TUNNEL_CONTROL_STORE = path.join(tmp, "store.json");

const Auth = require("../../core/auth.js");
const original = Auth.currentIdentity;
Auth.currentIdentity = () => ({
	ok: true, kind: "oauth", accountId: "bridge-test-account",
	userId: "bridge-test-account", clientId: "bridge-fixture",
	scopes: ["profile", "tunnel.mission"]
});
// Fresh-require the route so its destructured currentIdentity is the stub.
for (const rel of ["../agentRoomActions.js", "../routeGroups/agentRoomRoutes.js"]) {
	delete require.cache[require.resolve(rel)];
}
const Handler = require("../agentRoomActions.js");
const { agentRoomRoutes } = require("../routeGroups/agentRoomRoutes.js");
assert.equal(agentRoomRoutes["agent-room/bridge"], Handler.bridge);

const record = {
	id: "room_msg_route_1", sequence: 3, fromAgent: "implementer",
	kind: "status", body: "route-bridged hello", deviceId: "tun_fixture"
};
function ctx(payload) {
	return {
		request: { method: "POST", headers: {} },
		paramKinds: { POST: payload },
		response: { statusCode: 200, headersSent: false, setHeader() {} }
	};
}

(async () => {
	const first = JSON.parse(await Handler.bridge(ctx({ missionId: "mission-route", record })));
	assert.equal(first.ok, true); assert.equal(first.bridged, true);
	assert.equal(first.replayed, false);
	assert.equal(first.message.clientMessageId, "mission-room:mission-route:room_msg_route_1");
	const again = JSON.parse(await Handler.bridge(ctx({ missionId: "mission-route", record })));
	assert.equal(again.replayed, true);
	assert.equal(again.message.id, first.message.id);
	const snap = JSON.parse(await Handler.status({
		request: { method: "GET", headers: {} }, paramKinds: { GET: {} },
		response: { statusCode: 200, headersSent: false, setHeader() {} }
	}));
	assert.equal(snap.messages.filter(m => m.clientMessageId === first.message.clientMessageId).length, 1);
	// Unauthenticated bridge calls are refused by the existing auth gate.
	Auth.currentIdentity = () => ({ ok: false, error: "not_authenticated" });
	delete require.cache[require.resolve("../agentRoomActions.js")];
	const Fresh = require("../agentRoomActions.js");
	const denied = JSON.parse(await Fresh.bridge(ctx({ missionId: "m", record })));
	assert.equal(denied.ok, false); assert.equal(denied.error, "not_authenticated");
	Auth.currentIdentity = original;
	fs.rmSync(tmp, { recursive: true, force: true });
	console.log("B'H agent-room bridge route: wired, authed, replay-deduped ok");
})().catch(error => { console.error(error); process.exit(1); });
