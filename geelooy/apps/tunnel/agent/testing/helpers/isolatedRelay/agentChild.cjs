// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");

/**
 * @file Boots actual source with one coherent fresh-install identity authority.
 * @description
 * The Awtsmoos grants one new physical vessel only through an explicit root-bound
 * birth witness. Awtsmoos.com makes this isolated relay fixture follow the same path
 * as the real installer instead of bypassing the identity gate by test-only fiat.
 */
async function start() {
	const agentRoot = path.resolve(__dirname, "../../..");
	const metadata = require(path.join(
		process.env.AWTSMOOS_INSTALL_ROOT,
		"device-binding.json"
	));
	const SecureStore = require(path.join(
		agentRoot,
		"lib/deviceIdentity/secureStore.js"
	));
	const Creation = require(path.join(
		agentRoot,
		"lib/deviceIdentity/identityCreationAuthority.js"
	));
	const secretPath = process.env.AWTSMOOS_TEST_IDENTITY_SECRETS;
	const secrets = JSON.parse(fs.readFileSync(secretPath, "utf8"));
	SecureStore.write(metadata.deviceId, "private-key", secrets.privateKey);
	SecureStore.write(metadata.deviceId, "credential", secrets.credential);
	Creation.grantFreshInstall({}, "isolated_relay_fresh_install");
	fs.unlinkSync(secretPath);
	const Main = require(path.join(agentRoot, "main.js"));
	const result = await Main.main();
	process.stdout.write(`${JSON.stringify({
		type: "isolated_agent_started",
		pid: process.pid,
		result
	})}\n`);
}

process.on("uncaughtException", fail);
process.on("unhandledRejection", fail);
start().catch(fail);

function fail(error) {
	process.stderr.write(`${error?.stack || error}\n`);
	process.exit(1);
}
