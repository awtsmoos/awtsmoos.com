#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");
const DeviceIdentity = require("../lib/deviceIdentity/index.js");
const Policy = require("../recovery/emergencyPolicy.js");
const Slot = require("../recovery/emergencySlot.js");
const Paths = require("../recovery/emergencySlotPaths.js");

/** One small control mouth for capture, verification, and identity preparation. */
const [action = "status", rawSource = process.cwd(), rawRecovery = ""] =
	process.argv.slice(2);
const sourceRoot = path.resolve(rawSource);
const recoveryRoot = path.resolve(rawRecovery || `${sourceRoot}-recovery`);
const result = execute(action);
console.log(JSON.stringify(result, null, 2));
if (result.ok === false) process.exitCode = 1;

function execute(selectedAction) {
	switch (selectedAction) {
		case "capture":
			return Slot.capture(sourceRoot, recoveryRoot, {
				version: process.env.AWTSMOOS_RUNTIME_VERSION,
				manifestSha: process.env.AWTSMOOS_MANIFEST_SHA,
				port: process.env.AWTSMOOS_EMERGENCY_LOCAL_API_PORT
			});
		case "verify":
			return Slot.verify(recoveryRoot);
		case "prepare":
			return prepare();
		case "environment":
			return { ok: true, environment: Policy.environment() };
		case "status":
			return {
				...Slot.verify(recoveryRoot),
				pidFile: Paths.pid(recoveryRoot),
				logFile: Paths.log(recoveryRoot)
			};
		default:
			return { ok: false, error: "unknown_emergency_action", action: selectedAction };
	}
}

function prepare() {
	const verified = Slot.verify(recoveryRoot);
	if (!verified.ok) return verified;
	process.env.AWTSMOOS_RECOVERY_ROOT = recoveryRoot;
	const restored = DeviceIdentity.restoreHealthyIdentity({
		installRoot: verified.root
	});
	const identity = DeviceIdentity.load({ installRoot: verified.root });
	return {
		ok: identity.ok === true,
		state: identity.ok ? "prepared" : "identity_unavailable",
		root: verified.root,
		restored,
		deviceId: identity.deviceId || null,
		tunnelId: identity.tunnelId || null,
		environment: Policy.environment()
	};
}
