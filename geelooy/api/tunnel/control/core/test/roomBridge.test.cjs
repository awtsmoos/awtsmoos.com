//B"H
const assert = require("assert");
const Bridge = require("../revelation/roomBridge.js");
const Model = require("../accountRoom/model.js");

// Agent mission-room record shape (roomMessageRecord.build output fields).
const agentMsg = { id: "room_msg_1", sequence: 7, at: "t", fromAgent: "implementer", kind: "status", subject: "s", body: "wired the guard", references: [] };
const shared = Bridge.toShared(agentMsg, "mission-42");
assert.equal(shared.clientMessageId, "mission-room:mission-42:room_msg_1");
assert.equal(shared.message, "wired the guard"); assert.equal(shared.agentId, "implementer");

// It lands in the REAL account room, and a bridged re-send is a safe no-op.
const store = {};
Model.join(store, "acct1", {}, { agentId: shared.agentId, agentSessionId: shared.agentSessionId, deviceId: shared.deviceId, name: shared.name });
const first = Model.send(store, "acct1", {}, shared);
const again = Model.send(store, "acct1", {}, shared);
assert.equal(first.replayed, false); assert.equal(again.replayed, true);
assert.equal(first.message.id, again.message.id);

// Round trip preserves identity and body; unbridged entries stay unbridged.
const back = Bridge.fromShared({ ...first.message, content: first.message.content });
assert.equal(back.id, "room_msg_1"); assert.equal(back.body, "wired the guard"); assert.equal(back.bridged, true);
assert.equal(Bridge.fromShared({ id: "x", clientMessageId: "plain-1", content: "hi" }).bridged, false);
assert.throws(() => Bridge.toShared({}, "m"), /message_id_required/);
console.log("B'H room bridge: mission-room <-> account-room ok");
