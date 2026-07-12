// B"H

/**
 * B"H — An alias is a doorway, not a disguise. Canonical workers may serve a
 * request only when this treaty names them, while the response keeps the action
 * the caller actually used for end-to-end correlation.
 */
const aliases = {
	command: ["commandRun", "commandStart"],
	commandRun: ["commandRun", "commandStart"],
	shellCommand: ["shellCommand", "commandRun", "commandStart"],
	commandStart: ["commandStart", "commandRun"],
	commandStatus: ["commandStatus"],
	commandPoll: ["commandPoll", "commandStatus"],
	commandJobStatus: ["commandJobStatus", "commandStatus"],
	commandWait: ["commandWait", "commandStatus"],
	commandJobWait: ["commandJobWait", "commandWait", "commandStatus"],
	commandJobOutputPage: ["commandJobOutputPage"],
	commandOutputPage: ["commandOutputPage", "commandJobOutputPage"],
	commandCancel: ["commandCancel"],
	commandJobCancel: ["commandJobCancel", "commandCancel"]
};

function allowed(requestAction, actualAction) {
	return requestAction === actualAction || (aliases[requestAction] || []).includes(actualAction);
}

module.exports = { aliases, allowed };
