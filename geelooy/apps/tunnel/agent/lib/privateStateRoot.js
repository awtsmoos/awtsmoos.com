// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

/**
 * @file Resolves private state beneath one canonical recovery root.
 * @description
 * The Awtsmoos lets runtime code move through live and rollback garments while
 * identity, receipts, and continuation memory remain in one physical-device vessel.
 */
function recoveryRoot(environment = process.env) {
	if (environment.AWTSMOOS_RECOVERY_ROOT) {
		return path.resolve(environment.AWTSMOOS_RECOVERY_ROOT);
	}
	if (environment.AWTSMOOS_TEST_MODE === "1") {
		const installRoot = path.resolve(
			environment.AWTSMOOS_INSTALL_ROOT ||
			path.join(os.homedir(), ".awtsmoos-tunnel")
		);
		return `${installRoot}-recovery`;
	}
	return path.join(os.homedir(), ".awtsmoos-tunnel-recovery");
}

function root(environment = process.env) {
	if (environment.AWTSMOOS_PRIVATE_STATE_ROOT) {
		return path.resolve(environment.AWTSMOOS_PRIVATE_STATE_ROOT);
	}
	return path.join(recoveryRoot(environment), "state", "private");
}

function ensure(environment = process.env) {
	const directory = root(environment);
	fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
	fs.chmodSync(directory, 0o700);
	return directory;
}

module.exports = { ensure, recoveryRoot, root };
