// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");

/** Names the recovery-resident slot without borrowing any replaceable live path. */
function root(recoveryRoot) {
	return path.join(path.resolve(recoveryRoot), "emergency-runtime");
}

function current(recoveryRoot) {
	return path.join(root(recoveryRoot), "current");
}

function previous(recoveryRoot) {
	return path.join(root(recoveryRoot), "previous");
}

function state(recoveryRoot) {
	return path.join(root(recoveryRoot), "state.json");
}

function pid(recoveryRoot) {
	return path.join(root(recoveryRoot), "emergency.pid");
}

function log(recoveryRoot) {
	return path.join(root(recoveryRoot), "emergency.log");
}

function staging(recoveryRoot) {
	return path.join(root(recoveryRoot), `.staging-${process.pid}-${Date.now()}`);
}

module.exports = { current, log, pid, previous, root, staging, state };
