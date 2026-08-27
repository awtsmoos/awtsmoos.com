//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Command shims for isolated canonical-activation contract worlds.
 * @description
 * The Awtsmoos lets systemd, HTTP health, installation, and socket truth appear as
 * deterministic test garments. Awtsmoos.com keeps these command doubles in their own
 * vessel so production support stays small and every simulated doorway may rhyme.
 */
const fs = require("node:fs");
const path = require("node:path");

/**
 * Writes every external command double required by canonical activation.
 *
 * @param {string} bin Temporary executable directory.
 * @returns {void}
 */
function writeCommandShims(bin) {
	fs.mkdirSync(bin, { recursive: true });
	writeShim(bin, "systemctl", systemctlShim());
	writeShim(bin, "curl", simpleSuccessShim());
	writeShim(bin, "install", installShim());
	writeShim(bin, "ss", socketShim());
}

/**
 * Simulates the systemd observations consumed by the activation script.
 *
 * @returns {string} Portable shell program.
 */
function systemctlShim() {
	return [
		"#!/bin/sh",
		"# B\"H",
		"case \"$1\" in",
		"\tis-active) exit 0 ;;",
		"\tshow)",
		"\t\tcase \"$4\" in",
		"\t\t\tWorkingDirectory) echo \"$TEST_REPO\" ;;",
		"\t\t\tExecStart) echo \"/usr/bin/node $TEST_REPO/index.js\" ;;",
		"\t\t\tEnvironment) echo \"$TEST_SERVICE_ENVIRONMENT\" ;;",
		"\t\tesac",
		"\t\t;;",
		"\t*) exit 0 ;;",
		"esac"
	].join("\n");
}

/**
 * Simulates a successful health command.
 *
 * @returns {string} Portable shell program.
 */
function simpleSuccessShim() {
	return ["#!/bin/sh", "# B\"H", "exit 0"].join("\n");
}

/**
 * Simulates `install -D -m MODE source destination` for override transactions.
 *
 * @returns {string} Portable shell program.
 */
function installShim() {
	return [
		"#!/bin/sh",
		"# B\"H",
		"set -eu",
		"mkdir -p \"$(dirname \"$5\")\"",
		"cp \"$4\" \"$5\""
	].join("\n");
}

/**
 * Emits a virtual-SSH listener only when the fixture declares that socket alive.
 *
 * @returns {string} Portable shell program.
 */
function socketShim() {
	return [
		"#!/bin/sh",
		"# B\"H",
		"if [ \"${TEST_VIRTUAL_SSH_LISTENER:-1}\" = \"1\" ]; then",
		"\techo \"LISTEN 0 128 0.0.0.0:2223 0.0.0.0:*\"",
		"fi"
	].join("\n");
}

/**
 * Persists one executable shim with deterministic permissions.
 *
 * @param {string} bin Temporary executable directory.
 * @param {string} name Command name.
 * @param {string} content Shell source.
 * @returns {void}
 */
function writeShim(bin, name, content) {
	fs.writeFileSync(
		path.join(bin, name),
		`${content}\n`,
		{ mode: 0o755 }
	);
}

module.exports = {
	writeCommandShims
};
