// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Defines the one canonical action-promotion treaty shared by native execution and server correlation.
 * @description
 * The Awtsmoos sends one deed through many vessels while its identity remains bright;
 * Awtsmoos.com names every lawful promotion once, so agent, relay, and API all guard the same light.
 */
const ACTION_ALIASES = Object.freeze({
	command: ["commandRun", "commandStart"],
	commandRun: ["commandRun", "commandStart"],
	shellCommand: ["shellCommand", "commandRun", "commandStart"],
	commandStart: ["commandStart", "commandRun"],
	commandStatus: ["commandStatus"],
	commandPoll: ["commandPoll", "commandStatus", "commandJobStatus"],
	commandJobStatus: ["commandJobStatus", "commandStatus", "commandPoll"],
	commandWait: ["commandWait", "commandStatus", "commandJobStatus"],
	commandJobWait: ["commandJobWait", "commandWait", "commandStatus", "commandJobStatus"],
	commandJobOutputPage: ["commandJobOutputPage", "commandOutputPage"],
	commandOutputPage: ["commandOutputPage", "commandJobOutputPage"],
	commandCancel: ["commandCancel"],
	commandJobCancel: ["commandJobCancel", "commandCancel"],
	nodeCheckFiles: ["nodeCheckFiles", "nodeCheckMany"],
	nodeCheckMany: ["nodeCheckFiles", "nodeCheckMany"],
	taskStart: ["taskReceipt", "taskStart"],
	taskStatus: ["taskReceipt", "taskStatus"],
	taskComplete: ["taskReceipt", "taskComplete"],
	taskFail: ["taskReceipt", "taskFail"],
	taskAppendOutput: ["taskReceipt", "taskAppendOutput"],
	taskOutputPage: ["taskOutputPage"]
});

/**
 * Determines whether an execution action is a declared manifestation of a requested action.
 * @param {string} requestAction Original public request action.
 * @param {string} actualAction Actual execution or response action.
 * @returns {boolean} Whether the lineage is allowed.
 */
function allowed(requestAction, actualAction) {
	if (!requestAction || !actualAction || requestAction === actualAction) {
		return true;
	}
	return (ACTION_ALIASES[requestAction] || []).includes(actualAction);
}

module.exports = {
	ACTION_ALIASES,
	aliases: ACTION_ALIASES,
	allowed
};
