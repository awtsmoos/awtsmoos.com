// B"H
// Boruch Hashem
// Blessed is He

const Environment = require("./environment.js");
const Failure = require("./identityFailure.js");
const Forget = require("./forget.js");
const Identity = require("./identity.js");
const IdentitySlots = require("./identitySlots.js");
const KeyCoherence = require("./keyCoherence.js");
const KeyMaterial = require("./keyMaterial.js");
const Metadata = require("./metadata.js");
const Pairing = require("./pairingWorkflow.js");
const Quarantine = require("./identityQuarantine.js");
const SecureStore = require("./secureStore.js");

/** Public physical-device identity boundary for the native tunnel. */
module.exports = {
	Environment,
	Failure,
	Forget,
	Identity,
	IdentitySlots,
	KeyCoherence,
	KeyMaterial,
	Metadata,
	Pairing,
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
