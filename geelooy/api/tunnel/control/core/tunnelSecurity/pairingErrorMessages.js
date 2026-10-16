// B"H
// Boruch Hashem
// Blessed is He

const INSTALL_COMMAND = "curl -fsSL https://awtsmoos.com/api/tunnel/install/unix | bash";

/**
 * @file Human-friendly pairing failure guidance.
 * @description
 * The Awtsmoos never leaves a person staring at a raw code. Every pairing
 * failure explains what happened and exactly what to do next. Keep the
 * machine-readable `error` code untouched; this only adds the human layer.
 */
const MESSAGES = Object.freeze({
	pairing_not_found: {
		title: "Pairing code not found",
		message: "This pairing code wasn't found — it probably expired or was already used. Re-run the installer on your server to get a fresh code, then approve the new one.",
		action: INSTALL_COMMAND
	},
	pairing_code_mismatch: {
		title: "Pairing code does not match",
		message: "This code does not match the active pairing request. Check the exact characters shown by your installer; the request is still pending."
	},
	pairing_persistence_failed: {
		title: "Pairing could not be saved",
		message: "The server could not save this pairing request. Retry the installer; no valid approval code was issued."
	},
	pairing_expired: {
		title: "Pairing code expired",
		message: "This pairing code expired before it was approved. Re-run the installer on your server for a fresh code.",
		action: INSTALL_COMMAND
	},
	pairing_cancelled: {
		title: "Pairing cancelled",
		message: "Pairing was cancelled. Re-run the installer whenever you're ready.",
		action: INSTALL_COMMAND
	},
	pairing_rejected: {
		title: "Pairing rejected",
		message: "Pairing was rejected on the approval page. If that was a mistake, re-run the installer for a fresh code.",
		action: INSTALL_COMMAND
	},
	pairing_identity_conflict: {
		title: "Device identity conflict",
		message: "This device already has an active pairing that doesn't match. If this is your device and you reinstalled, reset the device identity on the server and pair fresh — or approve from the original installation."
	},
	pairing_binding_invalid: {
		title: "Pairing couldn't be completed",
		message: "Pairing couldn't be completed because of an identity mismatch. Re-run the installer for a fresh code.",
		action: INSTALL_COMMAND
	},
	invalid_device_public_key: {
		title: "Device key rejected",
		message: "The device's public key was rejected by the server. Re-run the installer to generate a fresh identity."
	},
	invalid_device_identity: {
		title: "Device identity incomplete",
		message: "The pairing request was missing device identity. Re-run the installer to start a fresh pairing."
	}
});

/** Returns the human guidance for a pairing error code, or a safe fallback. */
function forCode(code) {
	const entry = MESSAGES[String(code || "")];
	if (entry) return { ...entry };
	return {
		title: "Pairing failed",
		message: "Pairing failed. Re-run the installer on your server for a fresh code.",
		action: INSTALL_COMMAND
	};
}

/** Convenience: just the message text for API responses. */
function messageFor(code) {
	return forCode(code).message;
}

module.exports = { INSTALL_COMMAND, forCode, messageFor };
