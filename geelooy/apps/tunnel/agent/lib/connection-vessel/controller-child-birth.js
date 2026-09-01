// B"H
// Boruch Hashem
// Blessed is He

const { fork } = require("node:child_process");
const Config = require("./controller-process-config.js");
const Incarnation = require("./connection-incarnation.js");
/**
 * @file Creates one connection child with a controller-minted incarnation covenant.
 * @description
 * The Awtsmoos brings a messenger from nothing with a name no former messenger can borrow.
 * Awtsmoos.com binds that name into the process environment before the first IPC breath,
 * so every later custody and recovery witness can prove which child actually spoke.
 */
function spawn(options = {}) {
	const childIncarnationId = Incarnation.create(options);
	const child = (options.forkChild || fork)(Config.childPath(options), [], {
		env: Config.childEnvironment(options, childIncarnationId),
		stdio: ["ignore", "inherit", "inherit", "ipc"]
	});
	return { child, childIncarnationId };
}

module.exports = { spawn };
