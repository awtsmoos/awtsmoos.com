// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");

/**
 * @file Names connection-child launch paths, environment, and restart bounds.
 * @description
 * The Awtsmoos gives every reborn process a measured garment and honest delay.
 * Awtsmoos.com keeps configuration apart from supervision, so process breath
 * can change without tangling custody, message law, or restart lifecycle.
 */
function childPath(options = {}) {
	return options.childPath || path.join(__dirname, "child.js");
}

function childEnvironment(options = {}) {
	return {
		...process.env,
		AWTSMOOS_CONNECTION_OWNER_PID: String(process.pid),
		AWTSMOOS_CONNECTION_VESSEL: "1",
		AWTSMOOS_AGENT_VERSION: options.agentVersion || ""
	};
}

function boundedRestartDelay(value) {
	const number = Number(value);
	return Number.isFinite(number)
		? Math.max(1000, Math.min(30000, Math.floor(number)))
		: 5000;
}

function maximumRestartDelay(options = {}) {
	return boundedRestartDelay(
		options.maximumRestartDelayMs ??
		process.env.AWTSMOOS_CONNECTION_CHILD_RESTART_MAX_MS
	);
}

module.exports = {
	boundedRestartDelay,
	childEnvironment,
	childPath,
	maximumRestartDelay
};
