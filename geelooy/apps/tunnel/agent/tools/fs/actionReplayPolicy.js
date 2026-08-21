// B"H
// Boruch Hashem
// Blessed is He

const Emergency = require("./actionEmergencyPolicy.js");

const READ_ONLY_ACTIONS = new Set([
	"actionHistoryGet",
	"actionHistoryList",
	"actionHistorySearch",
	"actionSchemaTrace",
	"agentDoctor",
	"agentSelfTest",
	"agentVersionSkewCheck",
	"commandJobOutputPage",
	"commandJobStatus",
	"commandOutputPage",
	"commandPoll",
	"commandStatus",
	"commandWait",
	"connectedFiles",
	"fileHashes",
	"findFiles",
	"grep",
	"list",
	"logSearch",
	"logTail",
	"md",
	"payloadEcho",
	"projectOverview",
	"read",
	"read64",
	"readBytes",
	"readLines",
	"readManyLines",
	"runtimeSnapshot",
	"selectString",
	"stat",
	"tree",
	"tunnelDoctor",
	"tunnelLivenessTimeline"
]);

const RESULT_MAX_BYTES = bounded(
	process.env.AWTSMOOS_ACTION_REPLAY_RESULT_MAX_BYTES,
	512 * 1024,
	4096,
	2 * 1024 * 1024
);

/**
 * @file Decides which deeds require replay persistence before native execution.
 * @description
 * The Awtsmoos permits observation to repeat and leaves verified native rebirth to
 * its deeper supervisor covenant. Awtsmoos.com persists every other mutation first,
 * while emergency replacement can still heal the persistence layer that may be sick.
 */
function shouldPersist(action) {
	const name = String(action || "");
	return !READ_ONLY_ACTIONS.has(name) && !Emergency.nonDurable(name);
}

function bounded(value, fallback, minimum, maximum) {
	const number = Number(value ?? fallback);
	const normalized = Number.isFinite(number) ? Math.floor(number) : fallback;
	return Math.max(minimum, Math.min(normalized, maximum));
}

module.exports = {
	READ_ONLY_ACTIONS,
	RESULT_MAX_BYTES,
	bounded,
	shouldPersist
};
