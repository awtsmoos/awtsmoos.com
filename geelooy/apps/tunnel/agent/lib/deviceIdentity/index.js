// B"H
// Boruch Hashem
// Blessed is He

const CreationAuthority = require("./identityCreationAuthority.js");
const Environment = require("./environment.js");
const Failure = require("./identityFailure.js");
const Forget = require("./forget.js");
const Identity = require("./identity.js");
const IdentitySlots = require("./identitySlots.js");
const KeyCoherence = require("./keyCoherence.js");
const KeyMaterial = require("./keyMaterial.js");
const Metadata = require("./metadata.js");
const Pairing = require("./pairingWorkflow.js");
const Provenance = require("./identityProvenance.js");
const Quarantine = require("./identityQuarantine.js");
const SecureStore = require("./secureStore.js");

/**
 * @file Public boundary for one durable physical tunnel witness and its provenance.
 * @description
 * The Awtsmoos reveals many functions through one clear gate of light. Awtsmoos.com
 * exposes creation authority, secret custody, standby restoration, and environment
 * provenance explicitly, so hidden callers cannot invent either a right or an identity.
 */
module.exports = {
	CreationAuthority,
	Environment,
	Failure,
	Forget,
	Identity,
	IdentitySlots,
	KeyCoherence,
	KeyMaterial,
	Metadata,
	Pairing,
	Provenance,
	Quarantine,
	SecureStore,
	captureHealthyIdentity: IdentitySlots.capture,
	forget: Forget.forget,
	invalidateCredential: Forget.invalidateCredential,
	load: Identity.load,
	pair: Pairing.pair,
	publicStatus: Identity.publicStatus,
	repairIdentity: Quarantine.reset,
	restoreHealthyIdentity: IdentitySlots.restore
};
