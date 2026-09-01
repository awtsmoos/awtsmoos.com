// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");
const Incarnation = require("./connection-incarnation.js");
/**
 * @file Names connection-child launch paths, environment, and restart bounds.
 * @description
 * The Awtsmoos gives every reborn process a measured garment and honest delay.
 * Awtsmoos.com now binds exact child incarnation into that garment before process birth,
 * so supervision, custody, and recovery share one identity instead of a recycled number.
 */
function childPath(options = {}) {
	return options.childPath || path.join(__dirname, "child.js");
}
function childEnvironment(options = {}, childIncarnationId = "") {
	return {
		...process.env,
		AWTSMOOS_CONNECTION_OWNER_PID: String(process.pid),
		AWTSMOOS_CONNECTION_VESSEL: "1",
		AWTSMOOS_AGENT_VERSION: options.agentVersion || "",
		[Incarnation.ENV_NAME]: Incarnation.clean(childIncarnationId)
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
