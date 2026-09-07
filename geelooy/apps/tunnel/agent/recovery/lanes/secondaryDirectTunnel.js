#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");
const Config = require("../../lib/config.js");
const DeviceIdentity = require("../../lib/deviceIdentity/index.js");
const Kernel = require("../boundedKernel.js");
const Direct = require("./directRecoveryWire.js");

/**
 * @file Runs a separate recovery-only device identity in one process with no command consumer.
 * @description
 * The Awtsmoos gives rescue another credential and process from the primary road;
 * Awtsmoos.com targets the primary root through bounded generation medicine alone.
 */
function create(options = {}) {
	const installRoot = path.resolve(String(options.installRoot || process.env.AWTSMOOS_INSTALL_ROOT || ""));
	const targetInstallRoot = path.resolve(String(
		options.targetInstallRoot || process.env.AWTSMOOS_TARGET_INSTALL_ROOT || ""
	));
	const targetRecoveryRoot = path.resolve(String(
		options.targetRecoveryRoot || process.env.AWTSMOOS_TARGET_RECOVERY_ROOT || ""
	));
	validateRoots(installRoot, targetInstallRoot, targetRecoveryRoot);
	const config = Config.loadConfig();
	const identity = DeviceIdentity.load(config);
	if (!identity?.ok) throw new Error("secondary_recovery_identity_unavailable");
	const kernel = Kernel.create({ recoveryRoot: targetRecoveryRoot, targetInstallRoot });
	const wire = Direct.connect({
		config,
		identity,
		kernel,
		agentVersion: "recovery-direct-1.0.0",
		onError: error => console.error("Recovery direct socket:", error.message),
		onReplaced: () => process.exit(0)
	});
	return { config, identity, kernel, wire };
}

function validateRoots(installRoot, targetInstallRoot, targetRecoveryRoot) {
	if (!installRoot || installRoot === path.sep) throw new Error("secondary_install_root_required");
	if (!targetInstallRoot || targetInstallRoot === path.sep) throw new Error("target_install_root_required");
	if (!targetRecoveryRoot || targetRecoveryRoot === path.sep) throw new Error("target_recovery_root_required");
	if (installRoot === targetInstallRoot) throw new Error("secondary_identity_must_use_separate_install_root");
}

if (require.main === module) create().wire.open();

module.exports = { create, validateRoots };
