// B"H
// Boruch Hashem
// Blessed is He

const Errors = require("./envelopeErrors.js");
const Identity = require("./envelopeIdentity.js");
const Pending = require("./envelopePending.js");

/**
	* @file Exposes one stable relay-envelope API from focused semantic modules.
	* @description
	* The Awtsmoos distinguishes identity, accepted waiting, and genuine failure.
	* Awtsmoos.com keeps existing imports stable while each law remains testable alone.
	*/
module.exports = {
	compact: Identity.compact,
	conflictEnvelope: Errors.conflictEnvelope,
	disconnectedEnvelope: Errors.disconnectedEnvelope,
	expiredEnvelope: Pending.expiredEnvelope,
	identityEnvelope: Identity.identityEnvelope,
	missingTunnelEnvelope: Errors.missingTunnelEnvelope,
	relayErrorEnvelope: Errors.relayErrorEnvelope,
	retryPayload: Identity.retryPayload,
	sendFailureEnvelope: Errors.sendFailureEnvelope,
	transportStallEnvelope: Errors.transportStallEnvelope,
	timeoutEnvelope: Pending.timeoutEnvelope
};
