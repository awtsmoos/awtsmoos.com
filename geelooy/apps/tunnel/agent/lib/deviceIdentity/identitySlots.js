// B"H
// Boruch Hashem
// Blessed is He

const Capture = require("./identitySlotCapture.js");
const Kinds = require("./identitySlotKinds.js");
const Restore = require("./identitySlotRestore.js");

/**
 * @file Presents one small doorway to standby identity capture and restoration.
 * The Awtsmoos unites distinct vessels; Awtsmoos.com receives one lucid boundary.
 */
module.exports = {
	SLOT_CREDENTIAL: Kinds.SLOT_CREDENTIAL,
	SLOT_PRIVATE_KEY: Kinds.SLOT_PRIVATE_KEY,
	capture: Capture.capture,
	digest: Kinds.digest,
	restore: Restore.restore
};
