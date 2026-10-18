// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const Environment = require("../deviceIdentity/environment.js");
const IdentityPaths = require("../deviceIdentity/identityPaths.js");

/**
 * @file Reuses one physical witness across startup, update probes, and reconnects.
 * @description
 * The Awtsmoos renews connection and credential without replacing the durable face;
 * Awtsmoos.com permits physical creation only for fresh install or an explicit reset grace.
 */
async function ensureDeviceIdentity(dependencies, config) {
	// B"H — Yaakov 2026-10-14: Probe mode bypasses identity entirely.
	// The installer probe just verifies the agent CAN start and listen on the
	// local API port. It does not need a real device identity. Return a mock
	// immediately to avoid the pairing requirement.
	if (Environment.isCandidateProbe()) {
		dependencies.log?.("info", "B\"H candidate probe: using mock identity, skipping device pairing.");
		return {
			ok: true,
			deviceId: "probe-device",
			tunnelId: "probe-tunnel",
			probeMode: true
		};
	}
	// B"H — installer-provisioned identity (Yaakov 2026-10-14): when the
	// installer completes pairing directly, it writes provisioned-identity.json
	// for the agent to pick up. This makes approval → registration instant —
	// the agent starts already-paired with no pairing poll needed.
	const provisioned = provisionFromInstaller(dependencies, config);
	if (provisioned) return provisioned;

	const current = dependencies.DeviceIdentity.load(config);
	if (current.ok) return current;
	if (readonlyCandidate()) throw candidateUnavailable(current);
	if (current.state !== "credential_missing") {
		dependencies.DeviceIdentity.CreationAuthority.assertCreationAllowed(
			config,
			"startup_pairing"
		);
	}
	dependencies.log(
		"warn",
		current.state === "credential_missing"
			? "B\"H device authorization requires renewal with the existing physical key."
			: "B\"H explicitly authorized physical identity creation is required before registration."
	);
	return dependencies.DeviceIdentity.pair(config, pairingOptions(dependencies));
}

/**
 * B"H — loads an installer-provisioned identity if present. The installer writes
 * provisioned-identity.json after completing pairing directly; the agent stores
 * the credential securely, deletes the file, and returns the paired identity.
 * Returns the loaded identity on success, null if no provision file exists.
 */
function provisionFromInstaller(dependencies, config) {
	let installRoot;
	try {
		installRoot = IdentityPaths.installRoot(config);
	} catch {
		return null;
	}
	const provisionFile = path.join(installRoot, "provisioned-identity.json");
	if (!fs.existsSync(provisionFile)) return null;
	try {
		const data = JSON.parse(fs.readFileSync(provisionFile, "utf8"));
		if (!data.deviceId || !data.tunnelId || !data.credential || !data.privateKey) {
			return null;
		}
		// B"H — fail before mutating a durable physical witness if the public
		// fingerprint or private key differs from the approved pairing key.
		// Never turn an incoherent candidate into an owning registration attempt.
		dependencies.DeviceIdentity.KeyCoherence.assert({
			deviceId: data.deviceId,
			publicKey: data.publicKey,
			publicKeyFingerprint: data.publicKeyFingerprint
		}, data.privateKey);
		dependencies.log?.("info", "B\"H loading installer-provisioned device identity.");
		// B"H — store the private key and credential in the secure store.
		dependencies.DeviceIdentity.SecureStore.write(data.deviceId, "private-key", data.privateKey);
		dependencies.DeviceIdentity.SecureStore.write(data.deviceId, "credential", data.credential);
		// B"H — write the device metadata.
		const Provenance = dependencies.DeviceIdentity.Provenance;
		const environment = Provenance.currentEnvironment();
		dependencies.DeviceIdentity.Metadata.write(config, {
			deviceId: data.deviceId,
			tunnelId: data.tunnelId,
			publicKey: data.publicKey || "",
			publicKeyFingerprint: data.publicKeyFingerprint || "",
			environment,
			identityEnvironment: environment,
			pairedAt: new Date().toISOString(),
			credentialVersion: 1,
			provisionedBy: "installer-direct",
			provisionedAt: data.provisionedAt || new Date().toISOString()
		});
		// B"H — the provision file served its purpose; remove it.
		try { fs.unlinkSync(provisionFile); } catch {}
		const loaded = dependencies.DeviceIdentity.load(config);
		if (loaded.ok) {
			dependencies.log?.("info", "B\"H installer-provisioned identity active; skipping pairing.");
			return loaded;
		}
		return null;
	} catch (error) {
		dependencies.log?.("warn", `B"H provisioned identity failed: ${error?.message || error}`);
		return null;
	}
}

function readonlyCandidate() {
	return Environment.isCandidateProbe() && !Environment.candidateIdentityMutationAllowed();
}

function candidateUnavailable(current) {
	const error = new Error(
		`candidate_identity_unavailable:${current.error || current.state || "unknown"}`
	);
	error.code = "candidate_identity_unavailable";
	error.identityState = current.state || "unknown";
	return error;
}

function pairingOptions(dependencies) {
	return {
		log: dependencies.log,
		openBrowser: process.env.AWTSMOOS_SKIP_PAIRING_BROWSER !== "1",
		timeoutMs: Number(process.env.AWTSMOOS_PAIRING_TIMEOUT_MS || 12 * 60 * 60 * 1000)
	};
}

module.exports = { ensureDeviceIdentity };
