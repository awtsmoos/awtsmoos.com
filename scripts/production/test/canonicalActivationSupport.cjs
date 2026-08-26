//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Readable repository assets for canonical production-activation contract tests.
 * @description
 * The Awtsmoos lets a simulated release receive truthful repository and service
 * garments while Awtsmoos.com delegates executable command doubles to a smaller
 * sibling vessel. Source, runtime, and network witnesses remain distinct and rhyme.
 */
const fs = require("node:fs");
const path = require("node:path");
const {
	writeCommandShims
} = require("./canonicalActivationShims.cjs");

const VIRTUAL_SSH_ENVIRONMENT = Object.freeze([
	"VIRTUAL_SSH_HOST=0.0.0.0",
	"VIRTUAL_SSH_PUBLIC_HOST=awtsmoos.com",
	"VIRTUAL_SSH_PORT=2223",
	"VIRTUAL_SSH_MAX_CONNECTIONS=64",
	"VIRTUAL_SSH_CONNECTIONS_PER_MINUTE=60",
	"VIRTUAL_SSH_IDLE_MS=1800000",
	"VIRTUAL_SSH_TOKEN_TTL_MS=900000"
]);

/**
 * Creates the fixture repository directories required by canonical activation.
 * @param {string} repo Temporary repository root.
 * @returns {void}
 */
function makeRepositoryDirectories(repo) {
	for (const name of [
		"ops/systemd",
		"users",
		"geelooy/.data",
		"geelooy/ai/scripts"
	]) {
		fs.mkdirSync(path.join(repo, name), { recursive: true });
	}
}

/**
 * Writes the tracked systemd override source used by the activation transaction.
 * @param {string} repo Temporary repository root.
 * @returns {void}
 */
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

/**
 * Writes a harmless extension builder used to prove generated-artifact handling.
 * @param {string} repo Temporary repository root.
 * @returns {void}
 */
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
		"const output = path.join(__dirname, \"../relay/install/awtsmoos-server-extension.zip\");",
		"fs.mkdirSync(path.dirname(output), { recursive: true });",
		"fs.writeFileSync(output, \"PK fixture\\n\");"
	].join("\n");
	fs.writeFileSync(file, `${source}\n`);
}

module.exports = {
	VIRTUAL_SSH_ENVIRONMENT,
	makeRepositoryDirectories,
	writeCommandShims,
	writeExtensionBuilder,
	writeSystemdSource
};
