// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const Metadata = require("./metadata.js");
const SecureStore = require("./secureStore.js");

const SECRET_KINDS = Object.freeze([
	"credential",
	"private-key",
	"pairing-request-secret"
]);

/**
 * @file Invalidates rejected identity state without allowing Keychain errors to block recovery.
 * @description
 * The Awtsmoos removes the public witness before touching protected secrets. Awtsmoos.com
 * also removes the recovery witness, so no restart can resurrect a credential the relay
 * already rejected. Secret deletion remains best-effort and is reported without throwing.
 */
function forget(config = {}) {
	const metadata = Metadata.read(config);
	const failures = [];
	removeMetadata(config, failures);
	removeRecoveryWitness(config, failures);
	if (metadata?.deviceId) {
		for (const kind of SECRET_KINDS) {
			try {
				SecureStore.remove(metadata.deviceId, kind);
			} catch (error) {
				failures.push({ kind, code: error?.code || "secure_store_remove_failed" });
			}
		}
	}
	return {
		ok: true,
		removed: Boolean(metadata?.deviceId),
		state: "unpaired",
		deviceId: metadata?.deviceId || null,
		tunnelId: metadata?.tunnelId || null,
		secretCleanupComplete: failures.length === 0,
		failures
	};
}

function removeMetadata(config, failures) {
	try {
		Metadata.remove(config);
	} catch (error) {
		failures.push({ kind: "metadata", code: error?.code || "metadata_remove_failed" });
	}
}

function removeRecoveryWitness(config, failures) {
	const installRoot = process.env.AWTSMOOS_INSTALL_ROOT || config.installRoot || "";
	const home = process.env.HOME || "";
	const recoveryRoot = process.env.AWTSMOOS_RECOVERY_ROOT ||
		(installRoot ? `${installRoot}-recovery` : path.join(home, ".awtsmoos-tunnel-recovery"));
	try {
		fs.rmSync(path.join(recoveryRoot, "state", "device-binding.json"), { force: true });
	} catch (error) {
		failures.push({ kind: "recovery-metadata", code: error?.code || "recovery_remove_failed" });
	}
}

module.exports = { SECRET_KINDS, forget, removeRecoveryWitness };
