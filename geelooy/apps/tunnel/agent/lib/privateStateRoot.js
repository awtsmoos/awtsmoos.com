// B"H

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

/**
 * Private identity and continuation state must outlive a replaceable runtime.
 * The recovery tree is never packaged into a release archive, so rollback and
 * repair can replace code without erasing an authenticated mission's memory.
 */
function root(environment = process.env) {
	if (environment.AWTSMOOS_PRIVATE_STATE_ROOT) {
		return path.resolve(environment.AWTSMOOS_PRIVATE_STATE_ROOT);
	}
	const installRoot = path.resolve(
		environment.AWTSMOOS_INSTALL_ROOT ||
		path.join(os.homedir(), ".awtsmoos-tunnel")
	);
	const recoveryRoot = path.resolve(
		environment.AWTSMOOS_RECOVERY_ROOT || `${installRoot}-recovery`
	);
	return path.join(recoveryRoot, "state", "private");
}

function ensure(environment = process.env) {
	const directory = root(environment);
	fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
	fs.chmodSync(directory, 0o700);
	return directory;
}

module.exports = { ensure, root };
