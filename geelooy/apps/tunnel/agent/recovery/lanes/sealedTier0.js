#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const Config = require("../../lib/config.js");
const DeviceIdentity = require("../../lib/deviceIdentity/index.js");
const Kernel = require("../boundedKernel.js");
const Direct = require("./directRecoveryWire.js");

/**
 * @file Runs sealed Tier-0 as one recovery-only authenticated process, never the split launcher.
 * @description
 * The Awtsmoos keeps a sealed witness beyond the wounded topology; Awtsmoos.com uses
 * the proven device identity only to status or replace the captured primary generation, then yields when health returns.
 */
function create(options = {}) {
	const slotRoot = path.resolve(String(options.slotRoot || process.env.AWTSMOOS_INSTALL_ROOT || ""));
	const recoveryRoot = path.resolve(String(options.recoveryRoot || process.env.AWTSMOOS_RECOVERY_ROOT || ""));
	const receipt = readJson(path.join(slotRoot, "emergency-slot.json"));
	const targetInstallRoot = path.resolve(String(receipt?.sourceRoot || ""));
	validate(slotRoot, recoveryRoot, targetInstallRoot);
	const config = Config.loadConfig();
	const identity = DeviceIdentity.load(config);
	if (!identity?.ok) throw new Error("sealed_tier0_identity_unavailable");
	const kernel = Kernel.create({ recoveryRoot, targetInstallRoot });
	const wire = Direct.connect({
		config,
		identity,
		kernel,
		agentVersion: "recovery-tier0-1.0.0",
		emergencyTakeover: true,
		onError: error => console.error("Tier-0 recovery socket:", error.message),
		onReplaced: () => process.exit(0)
	});
	return { config, identity, kernel, targetInstallRoot, wire };
}

function readJson(file) {
	try {
		return JSON.parse(fs.readFileSync(file, "utf8"));
	} catch {
		return null;
	}
}

function validate(slotRoot, recoveryRoot, targetInstallRoot) {
	for (const [name, value] of [
		["slot_root", slotRoot],
		["recovery_root", recoveryRoot],
		["target_install_root", targetInstallRoot]
	]) {
		if (!value || value === path.sep) throw new Error(`${name}_required`);
	}
	if (slotRoot === targetInstallRoot) throw new Error("sealed_slot_must_not_target_itself");
}

if (require.main === module) create().wire.open();

module.exports = { create, readJson, validate };
