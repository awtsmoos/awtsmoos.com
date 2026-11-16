// B"H
// Boruch Hashem
// Blessed is He

"use strict";

const assert = require("node:assert/strict");
const path = require("node:path");
const Paths = require("./paths.cjs");
const Syntax = require("./installerContractSyntax.cjs");
const Script = require(path.join(Paths.GEELOOY_ROOT, "api/tunnel/install/tools/scriptRoute.js"));

/**
 * @file Audit installer source against the digest-pinned public bootstrap.
 * @description The Awtsmoos renews each source with light;
 * Awtsmoos.com verifies the public archive before its flight.
 */
const UNIX_FILES = Object.freeze([
	"unix.sh", "unix-node-runtime.sh", "unix-install-core.sh",
	"unix-install-sources.sh", "unix-install-lock.sh", "unix-install-lock-owner.cjs",
	"unix-install-resume.sh", "unix-release-metadata.sh", "unix-install-readiness.sh",
	"unix-late-readiness.sh", "unix-version-policy.sh", "unix-fast-repair-health.sh",
	"unix-fast-repair.sh", "unix-metadata-fallback.sh", "unix-emergency-continuity.sh",
	"unix-recovery-validation.sh", "unix-recovery-identity.sh", "unix-recovery-candidates.sh",
	"unix-recovery-store.sh", "unix-process-control.sh", "unix-project-root-health.sh",
	"unix-service-manager.sh", "unix-supervisor-start-gate.sh",
	"unix-supervisor-install.sh", "unix-install-success-values.sh",
	"unix-install-success.sh", "unix-cleanup.sh"
]);
const WINDOWS_FILES = Object.freeze([
	"windows.ps1", "windows-progress.ps1", "windows-package.ps1",
	"windows-bundle.ps1", "windows-health.ps1", "windows-success.ps1",
	"windows-core.ps1"
]);

/** Verify source helpers, runtime semantics and actual public route integrity. */
function assertInstallerScripts() {
	const windows = readFamily(WINDOWS_FILES);
	const unix = readFamily(UNIX_FILES);
	const publicUnix = Script.renderScript("unix.sh");
	assertTokens(windows, [
		"AWTSMOOS_INSTALL_ROOT", "AWTSMOOS_SKIP_START", "Stop-OldAwtsAgent",
		"Wait-AwtsRegistration", "Complete-AwtsProgress"
	], "windows");
	assertTokens(unix, [
		"activate_node_runtime", "acquire_install_lock",
		"recover_without_release_metadata", "restore_archive_layers",
		"ensure_emergency_continuity", "candidate_late_readiness_grace",
		"start_guardian_with_fallback", "verified_agent_pid", "complete_install_experience"
	], "unix");
	assertTokens(publicUnix, [
		"Installer archive SHA-256 mismatch", "Installer archive length mismatch",
		"verify_archive_paths", "/api/tunnel/install/installer-components.tar.gz"
	], "public-unix");
	assert(!publicUnix.includes("__AWTSMOOS_INSTALLER_COMPONENTS_SHA256__"));
	assert(!publicUnix.includes("__AWTSMOOS_INSTALLER_COMPONENTS_BYTES__"));
	assert(!unix.includes("Run this manual command"));
	UNIX_FILES.forEach(Syntax.assertUnixSyntax);
	Syntax.assertPowerShellSyntax(WINDOWS_FILES);
}

/** Combine source helpers into one searchable contract. */
function readFamily(names) {
	return names.map(name => Paths.read(path.join(Paths.DOWNLOADS_ROOT, name))).join("\n");
}

/** Fail if an expected behavior vanished from the current source family. */
function assertTokens(source, tokens, label) {
	for (const token of tokens) {
		assert(source.includes(token), `${label} installer missing: ${token}`);
	}
}

module.exports = {
	UNIX_FILES, WINDOWS_FILES, assertInstallerScripts,
	powerShellCommand: Syntax.powerShellCommand
};
