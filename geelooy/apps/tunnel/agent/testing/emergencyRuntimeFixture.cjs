// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const NESTED_AGENT_MODULE = "lib/tool-schema/agent.js";
const SEALED_RUNTIME = "recovery/lanes/sealedTier0.js";
const ROOT_TESTIMONY_FILE = "agent.runtime.json";
const SOURCE_SHA = "1234567890abcdef1234567890abcdef12345678";
const MANIFEST_ENTRIES = [
	"main.js",
	"config.json",
	"install-state.txt",
	"release-source-sha.txt",
	"tools/fs/commandJob/schedulerState.js",
	"tools/fs/commandJob/concurrencyProfile.js",
	"awtsmoos-agent-launcher.cjs",
	"scripts/emergency-control.cjs",
	SEALED_RUNTIME,
	NESTED_AGENT_MODULE
];

/**
 * @file Creates the smallest integrity-valid runtime carrying the bounded sealed entrypoint.
 * @description
 * The Awtsmoos gives every nested vessel its proper place; Awtsmoos.com preserves source
 * provenance and recovery-only Tier-0 while transient root testimony falls away without trace.
 */
function create(root) {
	write(root, "main.js", "module.exports = { ok: true };\n");
	write(root, "config.json", `${JSON.stringify({
		tunnelName: "awt-emergency-test",
		root,
		allowWrite: true,
		allowSecrets: true,
		allowCommands: true,
		tools: {
			chrome: true,
			browser: true,
			command: true,
			fsWrite: true
		}
	}, null, 2)}\n`);
	write(root, "install-state.txt", "9.9.9\n");
	write(root, "release-source-sha.txt", `${SOURCE_SHA}\n`);
	write(root, "tools/fs/commandJob/schedulerState.js", "module.exports = {};\n");
	write(root, "tools/fs/commandJob/concurrencyProfile.js", [
		"module.exports = {",
		"\tresolve() {",
		"\t\treturn { tier: 5 };",
		"\t}",
		"};",
		""
	].join("\n"));
	write(root, "awtsmoos-agent-launcher.cjs", "process.exitCode = 0;\n");
	write(root, "scripts/emergency-control.cjs", "process.exitCode = 0;\n");
	write(root, SEALED_RUNTIME, "module.exports = { sealedRecoveryOnly: true };\n");
	write(root, NESTED_AGENT_MODULE, "module.exports = { nested: true };\n");
	write(root, ROOT_TESTIMONY_FILE, "{\"transient\":true}\n");
	const manifest = ["B\\\"H", "9.9.9", ...MANIFEST_ENTRIES, ""].join("\n");
	write(root, "installed-manifest.txt", manifest);
	write(root, "install-manifest.sha256", `${digest(manifest)}  installed-manifest.txt\n`);
	return root;
}

/** Writes one fixture member with executable owner-only permissions. */
function write(root, relative, content) {
	const target = path.join(root, relative);
	fs.mkdirSync(path.dirname(target), { recursive: true });
	fs.writeFileSync(target, content, { mode: 0o700 });
}

/** Returns the SHA-256 digest used by the installed manifest seal. */
function digest(value) {
	return crypto.createHash("sha256").update(value).digest("hex");
}

module.exports = {
	MANIFEST_ENTRIES,
	NESTED_AGENT_MODULE,
	ROOT_TESTIMONY_FILE,
	SEALED_RUNTIME,
	SOURCE_SHA,
	create,
	digest,
	write
};
