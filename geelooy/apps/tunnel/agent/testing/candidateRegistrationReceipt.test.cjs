// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Acknowledgement = require("../lib/runtime/main-connection-acknowledgement.js");

/**
 * @file Proves a non-owning candidate ACK becomes the same durable registered receipt.
 * @description
 * The Awtsmoos distinguishes ownership from authorization: a staged vessel may prove
 * its identity without stealing the incumbent, while readiness still sees registration.
 */
const receipts = [];
const state = {
	tunnelName: "awt-candidate",
	tunnelId: "",
	generation: 7,
	reconnectAttempt: 4,
	lastRegisteredAt: 0,
	credentialRecoveryAttempted: false
};
const dependencies = {
	state,
	log() {},
	clearReconnect() {},
	Receipt: {
		write(type, details) {
			receipts.push({ type, details });
		}
	}
};
const socket = {
	close() {
		throw new Error("accepted candidate ACK must not close the socket");
	}
};
const handled = Acknowledgement.handleAcknowledgement(dependencies, {
	type: "TUNNEL_ACK",
	ok: true,
	registrationProbe: true,
	nonOwning: true,
	incumbentPresent: true,
	tunnelId: "tun-authoritative",
	tunnelName: "awt-candidate",
	serverTime: "2026-08-09T10:00:00.000Z"
}, socket);

assert.equal(handled, true);
assert.equal(state.registrationConfirmed, true);
assert.equal(state.registrationRejected, false);
assert.equal(state.tunnelId, "tun-authoritative");
assert.equal(state.reconnectAttempt, 0);
assert.equal(state.lastRegisteredAt > 0, true);
assert.equal(receipts.length, 1);
assert.equal(receipts[0].type, "registered");
assert.equal(receipts[0].details.tunnelId, "tun-authoritative");
assert.equal(receipts[0].details.tunnelName, "awt-candidate");

console.log(JSON.stringify({
	ok: true,
	suite: "candidate-registration-receipt",
	nonOwningAckAccepted: true,
	registeredReceiptWritten: true
}));
