// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const Lease = require("../lib/recovery-control/lease.js");
const Message = require("../lib/recovery-control/message.js");
const ParentControl = require("../lib/recovery-control/parent-control.js");
const Protocol = require("../lib/recovery-control/protocol.js");

/**
 * @file Proves the emergency frame stays bounded, fenced, and single-owner.
 * @description
 * The Awtsmoos gives healing one narrow gate; Awtsmoos.com refuses arbitrary verbs,
 * mismatched births, and racing actors before one exact parent rotation may sing.
 */
test("protocol accepts only status and exact parent rotation", () => {
	assert.equal(Protocol.normalizeControl({ id: "one", verb: "status" }).ok, true);
	assert.equal(Protocol.normalizeControl({ id: "two", verb: "rotate_parent" }).ok, true);
	assert.equal(Protocol.normalizeControl({ id: "three", verb: "shell" }).ok, false);
});

test("message refuses recovery before registration", () => {
	const sent = [];
	const message = Message.create({
		controller: { execute: () => ({ ok: true }) },
		isRegistered: () => false,
		Send: { safeSend: (_ws, value) => sent.push(value) }
	});
	assert.equal(message.handle({ type: Protocol.CONTROL_TYPE, id: "one", verb: "status" }, {}), true);
	assert.equal(sent[0].error, "recovery_control_registration_required");
});

test("two recovery actors cannot own one live lease", () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-recovery-lease-"));
	let clock = 1000;
	const one = Lease.create({ recoveryRoot: root, now: () => clock });
	const two = Lease.create({ recoveryRoot: root, now: () => clock });
	assert.equal(one.claim({ action: "rotate_parent", generation: 4 }).ok, true);
	assert.equal(two.claim({ action: "rotate_parent", generation: 4 }).error, "recovery_control_busy");
	clock += 16000;
	assert.equal(two.claim({ action: "rotate_parent", generation: 4 }).ok, true);
	fs.rmSync(root, { recursive: true, force: true });
});

test("exact identity is required before parent rotation", () => {
	const fixture = createControlFixture();
	const result = fixture.control.execute("rotate_parent", {
		expectedIdentity: { ...fixture.identity, birthToken: "wrong-birth" }
	}, "wrong");
	assert.equal(result.error, "recovery_control_identity_mismatch");
	assert.equal(fixture.requests.length, 0);
	fixture.cleanup();
});

test("one exact parent identity requests one fenced rotation", () => {
	const fixture = createControlFixture();
	const result = fixture.control.execute("rotate_parent", {
		expectedIdentity: fixture.identity
	}, "right");
	assert.equal(result.ok, true);
	assert.equal(result.state, "parent_rotation_requested");
	assert.deepEqual(fixture.requests, ["recovery_control_rotate_parent"]);
	fixture.cleanup();
});

function createControlFixture() {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-recovery-control-"));
	const identity = {
		parentPid: 4242,
		generation: 7,
		processGroupId: 4242,
		birthToken: "birth-seven",
		platform: "darwin"
	};
	const requests = [];
	const repairContext = {
		identity: {
			current: () => ({ ...identity }),
			matches: value => value?.parentPid === identity.parentPid &&
				value?.generation === identity.generation &&
				value?.birthToken === identity.birthToken
		},
		repair: {
			request: reason => {
				requests.push(reason);
				return true;
			},
			snapshot: () => ({ state: "idle" })
		}
	};
	return {
		cleanup: () => fs.rmSync(root, { recursive: true, force: true }),
		control: ParentControl.create({ recoveryRoot: root, repairContext }),
		identity,
		requests
	};
}
