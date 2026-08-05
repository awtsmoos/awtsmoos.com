// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

/** Creates the smallest integrity-valid runtime for emergency-slot proofs. */
function create(root) {
	write(root, "main.js", "module.exports = { ok: true };\n");
	write(root, "config.json", `${JSON.stringify({
		tunnelName: "awt-emergency-test",
		root,
		allowWrite: true,
		allowSecrets: true,
		allowCommands: true,
		tools: { chrome: true, browser: true, command: true }
	}, null, 2)}\n`);
	write(root, "install-state.txt", "9.9.9\n");
	write(root, "tools/fs/commandJob/schedulerState.js", "module.exports = {};\n");
	write(root, "tools/fs/commandJob/concurrencyProfile.js", [
		"module.exports = {",
		"\tresolve() { return { tier: 5 }; }",
		"};",
		""
	].join("\n"));
	write(root, "awtsmoos-agent-launcher.cjs", "process.exitCode = 0;\n");
	write(root, "scripts/emergency-control.cjs", "process.exitCode = 0;\n");
	const manifest = "B\\\"H\n9.9.9\n";
	write(root, "installed-manifest.txt", manifest);
	write(root, "install-manifest.sha256", `${digest(manifest)}  installed-manifest.txt\n`);
	return root;
}

function write(root, relative, content) {
	const target = path.join(root, relative);
	fs.mkdirSync(path.dirname(target), { recursive: true });
	fs.writeFileSync(target, content, { mode: 0o700 });
}

function digest(value) {
	return crypto.createHash("sha256").update(value).digest("hex");
}

module.exports = { create, digest, write };
