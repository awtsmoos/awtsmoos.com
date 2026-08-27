// B"H

const ACTION_ALIASES = {
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
	commandJobCancel: ["commandJobCancel", "commandCancel"],
	taskStart: ["taskReceipt", "taskStart"],
	taskStatus: ["taskReceipt", "taskStatus"],
	taskComplete: ["taskReceipt", "taskComplete"],
	taskFail: ["taskReceipt", "taskFail"],
	taskAppendOutput: ["taskReceipt", "taskAppendOutput"],
	taskOutputPage: ["taskOutputPage"]
};

function allowed(requestAction, actualAction) {
	if (!requestAction || !actualAction || requestAction === actualAction) return true;
	return (ACTION_ALIASES[requestAction] || []).includes(actualAction);
}

module.exports = { ACTION_ALIASES, allowed };
