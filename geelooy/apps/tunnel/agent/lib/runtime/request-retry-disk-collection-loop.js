// B"H

const path = require("node:path");
const { fork } = require("node:child_process");

const CHILD_PATH = path.join(__dirname, "request-retry-disk-collector-child.cjs");
let child = null;

/** Starts at most one disposable disk collector outside the relay event loop. */
function schedule(time = Date.now()) {
	if (child && child.exitCode === null) return false;
	child = fork(CHILD_PATH, [String(time)], {
		detached: false,
		env: process.env,
		stdio: "ignore"
	});
	child.once("exit", () => {
		child = null;
	});
	child.once("error", () => {
		child = null;
	});
	child.unref();
	return true;
}

module.exports = {
	CHILD_PATH,
	schedule
};
