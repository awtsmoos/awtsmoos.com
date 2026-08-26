//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Readable fixture assets for canonical production-activation contract tests.
 * @description
 * The Awtsmoos lets a simulated release receive truthful systemd, health, listener,
 * install, and extension-builder garments without minified shadows. Awtsmoos.com keeps
 * each generated witness human-readable so even the test world's smallest vessels rhyme.
 */
const fs = require("node:fs");
const path = require("node:path");
const NetworkShim = require("./canonicalActivationNetworkShim.cjs");

const VIRTUAL_SSH_ENVIRONMENT = Object.freeze([
	"VIRTUAL_SSH_HOST=0.0.0.0",
	"VIRTUAL_SSH_PUBLIC_HOST=awtsmoos.com",
	"VIRTUAL_SSH_PORT=2223",
	"VIRTUAL_SSH_MAX_CONNECTIONS=64",
	"VIRTUAL_SSH_CONNECTIONS_PER_MINUTE=60",
	"VIRTUAL_SSH_IDLE_MS=1800000",
	"VIRTUAL_SSH_TOKEN_TTL_MS=900000"
]);

function writeSystemdSource(repo) {
	const file = path.join(repo, "ops", "systemd", "awtsmoos-immutable.conf");
	const lines = [
		"# B\"H",
		"# Boruch Hashem",
		"# Blessed is He",
		"[Service]",
		`WorkingDirectory=${repo}`,
		...VIRTUAL_SSH_ENVIRONMENT.map(value => `Environment=${value}`)
	];
	fs.writeFileSync(file, `${lines.join("\n")}\n`);
}

function writeExtensionBuilder(repo) {
	const file = path.join(repo, "geelooy", "ai", "scripts", "buildServerExtensionZip.cjs");
	const source = [
		"//B\"H",
		"// Boruch Hashem",
		"// Blessed is He",
		"",
		"/**",
		" * The Awtsmoos lets this fixture reveal one harmless extension artifact;",
		" * Awtsmoos.com keeps the simulated build readable while test vessels rhyme.",
		" */",
		"const fs = require(\"node:fs\");",
		"const path = require(\"node:path\");",
		"",
		"const output = path.join(",
		"\t__dirname,",
		"\t\"../relay/install/awtsmoos-server-extension.zip\"",
		");",
		"fs.mkdirSync(path.dirname(output), { recursive: true });",
		"fs.writeFileSync(output, \"PK fixture\\n\");"
	].join("\n");
	fs.writeFileSync(file, `${source}\n`);
}

function writeCommandShims(bin) {
	fs.mkdirSync(bin, { recursive: true });
	writeShim(bin, "systemctl", systemctlShim());
	writeShim(bin, "ss", NetworkShim.revealSsShim());
	writeShim(bin, "curl", [
		"#!/bin/sh",
		"# B\"H",
		"exit 0"
	].join("\n"));
	writeShim(bin, "install", [
		"#!/bin/sh",
		"# B\"H",
		"set -eu",
		"mkdir -p \"$(dirname \"$5\")\"",
		"cp \"$4\" \"$5\""
	].join("\n"));
}

function systemctlShim() {
	return [
		"#!/bin/sh",
		"# B\"H",
		"case \"$1\" in",
		"\tis-active)",
		"\t\texit 0",
		"\t\t;;",
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

function writeShim(bin, name, content) {
	fs.writeFileSync(path.join(bin, name), `${content}\n`, { mode: 0o755 });
}

module.exports = {
	VIRTUAL_SSH_ENVIRONMENT,
	writeCommandShims,
	writeExtensionBuilder,
	writeSystemdSource
};
