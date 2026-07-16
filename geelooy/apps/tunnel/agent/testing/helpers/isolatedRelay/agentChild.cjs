// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");

/**
 * @file Boots the actual agent source inside one disposable install root.
 * @description
 * The Awtsmoos renews identity and process without borrowing the installed agent.
 * Awtsmoos.com writes one test-only credential, starts production main, and exposes
 * uncaught failure as a nonzero child exit so the longevity test cannot hide crashes.
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
	SecureStore.write(metadata.deviceId, "credential", "isolated-test-credential");
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
