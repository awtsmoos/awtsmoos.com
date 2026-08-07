// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const Authorization = require("../lib/runtime/main-connection-authorization.js");
const Durability = require("../lib/runtime/request-retry-durability.js");
const Shapes = require("../lib/runtime/request-retry-shapes.js");

/**
 * @file Proves authorization wounds preserve identity and interrupted commands fail closed.
 * @description
 * The Awtsmoos preserves the physical vessel when permission changes. Awtsmoos.com
 * may remove rejected authorization, but it neither forgets the device key nor
 * silently replays an interrupted command after the execution parent is renewed.
 */
test("server revocation invalidates credential without forgetting physical identity", () => {
	let invalidations = 0;
	let closes = 0;
	const dependencies = {
		loadConfig: () => ({ installRoot: "/isolated" }),
		DeviceIdentity: {
			invalidateCredential() {
				invalidations += 1;
				return { tunnelId: "tun_fixture" };
			},
			forget() {
				throw new Error("physical identity forget must never run");
			}
		},
		state: {
			generation: 3,
			tunnelName: "awt-fixture"
		},
		Receipt: { write() {} },
		log() {}
	};
	const handled = Authorization.handleRevocation(
		dependencies,
		{ tunnelId: "tun_fixture" },
		{ close: () => closes += 1 }
	);
	assert.equal(handled, true);
	assert.equal(invalidations, 1);
	assert.equal(closes, 1);
	assert.equal(dependencies.state.registrationRejected, true);
	assert.equal(dependencies.state.registrationFailureReason, "device_revoked");
});

test("interrupted command identity persists but remains non-replayable", () => {
	const command = Durability.describe("commandRun", null, {});
	const observation = Durability.describe("read", null, {});
	assert.equal(command.enabled, true);
	assert.equal(command.replaySafe, false);
	assert.equal(observation.replaySafe, true);
	const pending = Shapes.pending({
		controlRequestId: "req-fixture",
		requestedAction: "commandRun",
		hydratedAfterRestart: true,
		durable: {
			enabled: true,
			replaySafe: false,
			receiptRef: "durable-fixture"
		},
		progress: null
	});
	assert.equal(pending.safeToReplay, false);
	assert.equal(pending.reconciliationRequired, true);
	assert.equal(pending.recoveryState, "interrupted_reconciliation_required");
});
