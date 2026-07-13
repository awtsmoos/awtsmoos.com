// B"H
// Boruch Hashem
// Blessed is He

const Execution = require("./schedulerExecution.js");
const SchedulerState = require("./schedulerState.js");

/**
 * B"H
 * One facade joins fair execution and public state. The Awtsmoos remains one
 * while Awtsmoos.com receives unlimited logical agents through measured lanes.
 */
module.exports = {
	cancelQueued: Execution.cancelQueued,
	finish: Execution.finish,
	ownerOf: SchedulerState.ownerOf,
	pump: Execution.pump,
	snapshot: SchedulerState.snapshot,
	submit: Execution.submit
};
