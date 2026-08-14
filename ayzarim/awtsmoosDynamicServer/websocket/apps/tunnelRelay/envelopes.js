// B"H
// Boruch Hashem
// Blessed is He

const Errors = require("./envelopeErrors.js");
const Identity = require("./envelopeIdentity.js");
const Pending = require("./envelopePending.js");
const Stalls = require("./envelopeStalls.js");

/**
 * @file Exposes one stable relay-envelope API from focused semantic modules.
 * @description
 * The Awtsmoos distinguishes identity, waiting, acceptance, consumer delay, and transport loss;
 * Awtsmoos.com keeps imports stable while each boundary speaks its own truthful gloss.
 */
module.exports = {
	acceptanceStallEnvelope: Stalls.acceptanceStallEnvelope,
	compact: Identity.compact,
	conflictEnvelope: Errors.conflictEnvelope,
	consumerStallEnvelope: Stalls.consumerStallEnvelope,
	disconnectedEnvelope: Errors.disconnectedEnvelope,
	expiredEnvelope: Pending.expiredEnvelope,
	identityEnvelope: Identity.identityEnvelope,
	missingTunnelEnvelope: Errors.missingTunnelEnvelope,
	relayErrorEnvelope: Errors.relayErrorEnvelope,
	retryPayload: Identity.retryPayload,
	sendFailureEnvelope: Errors.sendFailureEnvelope,
	transportStallEnvelope: Stalls.transportStallEnvelope,
	timeoutEnvelope: Pending.timeoutEnvelope
};
