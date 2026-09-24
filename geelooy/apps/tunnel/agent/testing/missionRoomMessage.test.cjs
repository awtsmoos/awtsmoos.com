// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const Message = require("../tools/fs/actionGroups/missionRoomMessagePayload.js");
const Dispatch = require("../lib/runtime/main-dispatch.js");

/**
 * @file Proves an explicit Mission Room kind survives transport normalization.
 * @description
 * The Awtsmoos never lets the vessel swallow the message. Awtsmoos.com proves explicit
 * completion/handoff/progress kinds keep their meaning after kind detection routes the
 * action to the fs vessel, nested params carriers unwrap, and transport kinds never
 * masquerade as semantic event kinds.
 */

test("explicit completion keeps its kind and recognized completion", () => {
	const normalized = Message.normalize({ action: "missionRoomMessage", kind: "completion", message: "All done." });
	assert.equal(normalized.kind, "completion");
	assert.equal(normalized.eventKind, "completion");
	assert.equal(normalized.kindRecognized, true);
	assert.equal(normalized.complete, true);
});

test("transport kind fs never becomes the semantic event kind", () => {
	const normalized = Message.normalize({ action: "missionRoomMessage", kind: "fs", eventKind: "handoff", message: "Passing the torch." });
	assert.equal(normalized.kind, "handoff");
	assert.equal(normalized.eventKind, "handoff");
});

test("bare transport kind falls back to chat instead of fs", () => {
	const normalized = Message.normalize({ action: "missionRoomMessage", kind: "fs", message: "Hello." });
	assert.equal(normalized.kind, "chat");
	assert.equal(normalized.kindRecognized, true);
});

test("nested params carriers unwrap for body and kind", () => {
	const normalized = Message.normalize({ action: "missionRoomMessage", params: { message: "Halfway there.", kind: "progress" } });
	assert.equal(normalized.body, "Halfway there.");
	assert.equal(normalized.message, "Halfway there.");
	assert.equal(normalized.kind, "progress");
});

test("nested params eventKind survives a top-level transport kind", () => {
	const normalized = Message.normalize({ action: "missionRoomMessage", kind: "fs", params: { eventKind: "completion", message: "Done." } });
	assert.equal(normalized.kind, "completion");
	assert.equal(normalized.complete, true);
});

test("unknown kinds are kept verbatim but flagged unrecognized", () => {
	const normalized = Message.normalize({ action: "missionRoomMessage", kind: "mycustom", message: "Custom." });
	assert.equal(normalized.kind, "mycustom");
	assert.equal(normalized.kindRecognized, false);
});

test("complete flag still implies completion", () => {
	const normalized = Message.normalize({ body: "Finished verifier work.", complete: true, agentId: "agent-a" });
	assert.equal(normalized.message, "Finished verifier work.");
	assert.equal(normalized.kind, "completion");
	assert.equal(normalized.fromAgent, "agent-a");
});

test("payloadWithKind preserves the semantic kind across transport overwrite", () => {
	const routed = Dispatch.payloadWithKind({ action: "missionRoomMessage", kind: "completion", message: "Done." }, "fs");
	assert.equal(routed.kind, "fs");
	assert.equal(routed.eventKind, "completion");
	assert.equal(routed.messageKind, "completion");
});

test("payloadWithKind leaves transport kinds and empty kinds alone", () => {
	assert.equal(Dispatch.payloadWithKind({ kind: "fs" }, "fs").eventKind, undefined);
	assert.equal(Dispatch.payloadWithKind({ kind: "command" }, "command").eventKind, undefined);
	assert.equal(Dispatch.payloadWithKind({}, "fs").eventKind, undefined);
});

test("end to end: explicit kind survives the dispatch path into normalize", () => {
	const incoming = { action: "missionRoomMessage", kind: "completion", message: "Done." };
	const routed = Dispatch.payloadWithKind(incoming, "fs");
	const normalized = Message.normalize(routed);
	assert.equal(normalized.kind, "completion");
	assert.equal(normalized.eventKind, "completion");
	assert.equal(normalized.body, "Done.");
});
