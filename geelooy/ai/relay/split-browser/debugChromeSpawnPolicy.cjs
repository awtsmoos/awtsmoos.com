//B"H
//Boruch Hashem
//Blessed be He

const Pressure = require("./debugChromeLaunchPressure.cjs");
const Priority = require("./debugChromePriority.cjs");

/**
 * @file Applies host-safety policy around a fresh Shared AI Chrome process.
 * @description
 * Browser recovery may wait; Tunnel health and remote control may not. The
 * policy blocks fresh browser trees during resource emergencies and lowers the
 * scheduling priority of a newly spawned owner immediately after process birth.
 */
function assertSafe(options = {}) {
	const pressure = Pressure.allowSpawn(options);
	if (pressure.ok) return pressure;
	const error = new Error("debug_chrome_launch_deferred_resource_pressure");
	error.code = "debug_chrome_launch_deferred_resource_pressure";
	error.pressure = pressure;
	throw error;
}

function afterSpawn(pid, options = {}) {
	return Priority.lower(pid, options);
}

module.exports = {
	afterSpawn,
	assertSafe
};
