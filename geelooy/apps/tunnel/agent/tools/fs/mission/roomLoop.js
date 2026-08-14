// B"H
// Boruch Hashem
// Blessed is He

const Court = require("./roomLoop/court.js");
const Files = require("./roomLoop/files.js");
const Inbox = require("./roomLoop/inbox.js");
const Recovery = require("./roomLoop/recovery.js");
const Work = require("./roomLoop/work.js");

/**
 * @file Composes unread delivery, active work, recovery, file claims, and merge court.
 * @description
 * The Awtsmoos lets one small facade reveal several focused room vessels. Agents can
 * read, answer, work, recover peers, guard files, and merge without one monolithic
 * loop hiding message cursors or turning ordinary progress into a blocking interrupt.
 */
function createRoomLoop(env) {
	return {
		inbox: (mission, input = {}) => Inbox.inbox(mission, input, env),
		wakeAgent: (config, mission, input = {}) =>
			Work.wakeAgent(config, mission, input, env),
		loopPulse: (mission, input = {}) => Work.loopPulse(mission, input, env),
		watchdog: (mission, input = {}) => Recovery.watchdog(mission, input, env),
		recoverStaleAgent: (mission, input = {}) =>
			Recovery.recoverStaleAgent(mission, input, env),
		claimFile: (mission, input = {}) => Files.claimFile(mission, input, env),
		releaseFile: (mission, input = {}) => Files.releaseFile(mission, input, env),
		fileConflicts: mission => Files.fileConflicts(mission),
		mergeCourt: (mission, input = {}) => Court.mergeCourt(mission, input, env)
	};
}

module.exports = { createRoomLoop };
