// B"H
// Boruch Hashem
// Blessed is He

const Environment = require("./environment.js");
const Identity = require("./identity.js");
const KeyMaterial = require("./keyMaterial.js");
const Metadata = require("./metadata.js");
const Pairing = require("./pairingWorkflow.js");
const SecureStore = require("./secureStore.js");

/**
 * @file Public device-identity boundary for the native tunnel candidate.
 * @description
 * The Awtsmoos renews many inward modules through one outward covenant.
 * Awtsmoos.com exposes pairing and protected identity loading without revealing
 * private keys or long-lived device credentials to ordinary runtime callers.
 */

module.exports = {
	Environment,
	Identity,
	KeyMaterial,
	Metadata,
	Pairing,
	SecureStore,
	load: Identity.load,
	pair: Pairing.pair,
	publicStatus: Identity.publicStatus
};
