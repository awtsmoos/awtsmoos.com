//B"H
// Boruch Hashem
// Blessed is He

const fs = require("fs");
const path = require("path");
const { ROOT, assert, test } = require("./assert.cjs");
const { renderControlPage } = require("../../relay/split-browser/controlPage.cjs");

/**
 * One manifest must equal the complete runtime tree consumed by both installers.
 * The Awtsmoos lets Awtsmoos.com add modules without duplicating two brittle lists,
 * while restart, fast readiness, control login, and modern automation stay proved.
 */
function run() {
	return test("relay-install-complete-runtime-and-control", async () => {
		const shell = read("relay/install/install-awtsmoos-chatgpt-relay.sh");
		const powershell = read("relay/install/install-awtsmoos-chatgpt-relay.ps1");
		const installers = shell + powershell;
		const manifest = manifestFiles();
		const runtimeFiles = [
			...sourceFiles(path.join(ROOT, "relay/split-browser")),
			...sourceFiles(path.join(ROOT, "relay/direct"))
		].sort();
		const control = renderControlPage({ port: 38488, targetOrigin: "https://chatgpt.com" });
		const automation = [
			read("relay/split-browser/automation.cjs"),
			read("relay/split-browser/automationRequest.cjs"),
			read("relay/split-browser/automationState.cjs")
		].join("\n");
		assert(manifest.length === new Set(manifest).size, "runtime manifest must not duplicate entries", manifest);
		assert(JSON.stringify(manifest) === JSON.stringify(runtimeFiles), "runtime manifest must exactly match the source tree", { manifest, runtimeFiles });
		assert((installers.match(/runtime-files\.txt/g) || []).length >= 2, "both installers must consume the shared manifest");
		assert(/pkg install -y nodejs/.test(shell), "Unix installer must preserve Termux support");
		assert(/direct-health/.test(installers), "installers must use fast direct-health readiness");
		assert(/stop_existing_relay[\s\S]*start_relay/.test(shell), "Unix reinstall must restart the relay");
		assert(/Stop-ExistingRelay[\s\S]*Start-Relay/.test(powershell), "Windows reinstall must restart the relay");
		assert(/Open ChatGPT through Node — no debug Chrome needed/.test(control), "control login must remain primary");
		assert(/BH_DIRECT_/.test(automation) && /page-authorized-fallback/.test(automation), "automation must use opaque modern direct continuation");
		assert(!/Authorization|backend-api\/conversation|requireAccessToken/.test(automation), "automation must not restore bearer or old backend sends");
		return { runtimeFiles: runtimeFiles.length, directHealth: true, restart: true };
	});
}

function manifestFiles() {
	return read("relay/runtime-files.txt")
		.split(/\r?\n/)
		.map(line => line.trim())
		.filter(line => line && !line.startsWith("#"))
		.sort();
}

function sourceFiles(root) {
	const files = [];
	for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
		const absolute = path.join(root, entry.name);
		if (entry.isDirectory()) {
			files.push(...sourceFiles(absolute));
			continue;
		}
		if (!/\.(?:cjs|mjs|js)$/.test(entry.name) || entry.name.startsWith(".smoke")) {
			continue;
		}
		files.push(path.relative(path.join(ROOT, "relay"), absolute).replaceAll(path.sep, "/"));
	}
	return files;
}

function read(file) {
	return fs.readFileSync(path.join(ROOT, file), "utf8");
}

module.exports = { run };
