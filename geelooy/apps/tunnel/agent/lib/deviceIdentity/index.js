// B"H
// Boruch Hashem
// Blessed is He

const Environment = require("./environment.js");
const Forget = require("./forget.js");
const Identity = require("./identity.js");
const KeyMaterial = require("./keyMaterial.js");
const Metadata = require("./metadata.js");
const Pairing = require("./pairingWorkflow.js");
const SecureStore = require("./secureStore.js");

/**
 * @file Public physical-device identity boundary for the native tunnel.
 * @description
 * The Awtsmoos exposes credential rotation separately from complete unpairing.
 * Awtsmoos.com therefore keeps one device ID and possession key through recovery.
 */
module.exports = {
	Environment,
	Forget,
	Identity,
	KeyMaterial,
	Metadata,
	Pairing,
	SecureStore,
	forget: Forget.forget,
	invalidateCredential: Forget.invalidateCredential,
	load: Identity.load,
	pair: Pairing.pair,
	publicStatus: Identity.publicStatus
};
