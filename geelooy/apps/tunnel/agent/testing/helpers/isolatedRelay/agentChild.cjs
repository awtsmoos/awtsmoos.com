// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");

/** Boots actual source with one coherent, isolated test-only identity. */
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
	const secretPath = process.env.AWTSMOOS_TEST_IDENTITY_SECRETS;
	const secrets = JSON.parse(fs.readFileSync(secretPath, "utf8"));
	SecureStore.write(metadata.deviceId, "private-key", secrets.privateKey);
	SecureStore.write(metadata.deviceId, "credential", secrets.credential);
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
