// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const path = require("node:path");
const Paths = require("./paths.cjs");
const Syntax = require("./installerContractSyntax.cjs");

/**
 * @file Audits the split installer families as one self-healing covenant.
 * @description
 * The Awtsmoos renews every helper behind one command; Awtsmoos.com requires fresh
 * bootstrap, exact Node, recovery archives, Tier-Zero continuity, and guarded success.
 */
const UNIX_FILES = Object.freeze([
	"unix.sh",
	"unix-node-runtime.sh",
	"unix-install-core.sh",
	"unix-install-sources.sh",
	"unix-install-lock.sh",
	"unix-install-lock-owner.cjs",
	"unix-install-resume.sh",
	"unix-release-metadata.sh",
	"unix-install-readiness.sh",
	"unix-late-readiness.sh",
	"unix-version-policy.sh",
	"unix-fast-repair-health.sh",
	"unix-fast-repair.sh",
	"unix-metadata-fallback.sh",
	"unix-emergency-continuity.sh",
	"unix-recovery-validation.sh",
	"unix-recovery-identity.sh",
	"unix-recovery-candidates.sh",
	"unix-recovery-store.sh",
	"unix-process-control.sh",
	"unix-project-root-health.sh",
	"unix-service-manager.sh",
	"unix-supervisor-start-gate.sh",
	"unix-supervisor-install.sh",
	"unix-install-success-values.sh",
	"unix-install-success.sh",
	"unix-cleanup.sh"
]);
const WINDOWS_FILES = Object.freeze([
	"windows.ps1",
	"windows-progress.ps1",
	"windows-package.ps1",
	"windows-bundle.ps1",
	"windows-health.ps1",
	"windows-success.ps1",
	"windows-core.ps1"
]);

/** Verifies user-visible semantics and parses every audited installer helper. */
function assertInstallerScripts() {
	const windows = readFamily(WINDOWS_FILES);
	const unix = readFamily(UNIX_FILES);
	assertTokens(windows, [
		"AWTSMOOS_INSTALL_ROOT",
		"AWTSMOOS_SKIP_START",
		"Stop-OldAwtsAgent",
		"Wait-AwtsRegistration",
		"Complete-AwtsProgress"
	], "windows");
	assertTokens(unix, [
		"curl -fsSL https://awtsmoos.com/api/tunnel/install/unix | AWTSMOOS_RESTART=1 bash",
		"activate_node_runtime",
		"acquire_install_lock",
		"recover_without_release_metadata",
		"restore_archive_layers",
		"ensure_emergency_continuity",
		"candidate_late_readiness_grace",
		"start_guardian_with_fallback",
		"verified_agent_pid",
		"complete_install_experience"
	], "unix");
	assert.equal(unix.includes("Run this manual command"), false);
	UNIX_FILES.forEach(Syntax.assertUnixSyntax);
	Syntax.assertPowerShellSyntax(WINDOWS_FILES);
}

/** Joins one installer family into a searchable contract document. */
function readFamily(names) {
	return names.map(name => Paths.read(
		path.join(Paths.DOWNLOADS_ROOT, name)
	)).join("\n");
}

/** Requires every behavioral token to remain discoverable in its family. */
function assertTokens(source, tokens, label) {
	for (const token of tokens) {
		assert.equal(source.includes(token), true,
			`${label} installer missing: ${token}`);
	}
}

module.exports = {
	UNIX_FILES,
	WINDOWS_FILES,
	assertInstallerScripts,
	powerShellCommand: Syntax.powerShellCommand
};
