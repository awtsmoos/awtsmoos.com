// B"H
// Boruch Hashem
// Blessed is He

const Files = require("./files.js");
const Recovery = require("./recovery.js");

function mergeCourt(mission, input, env) {
	const room = env.RoomState.ensure(mission, input);
	const issues = [];
	if ((room.interrupts || []).some(item => item.status === "blocking")) {
		issues.push("open_interrupts");
	}
	if (Recovery.watchdog(mission, input, env).stale.length) issues.push("stale_agents");
	if (Files.fileConflicts(mission).length) issues.push("file_conflicts");
	if ((room.subMissions || []).some(item =>
		item.status !== "done" && input.requireSubMissionsDone === true)) {
		issues.push("unfinished_sub_missions");
	}
	const ok = issues.length === 0;
	const court = {
		ok,
		issues,
		verdict: ok ? "merge_allowed" : "merge_blocked",
		mustCallNext: ok
			? { action: "missionRoomMergeReports", missionId: mission.id }
			: nextForIssue(mission, issues[0], env)
	};
	room.mergeCourts ||= [];
	room.mergeCourts.push({ ...court, at: env.RoomState.now() });
	return court;
}

function nextForIssue(mission, issue, env) {
	if (issue === "open_interrupts") return env.RoomInterrupts.mustCallNext(mission, env);
	if (issue === "file_conflicts") {
		return { action: "missionRoomReleaseFile", missionId: mission.id };
	}
	if (issue === "stale_agents") {
		return { action: "missionRoomWatchdog", missionId: mission.id };
	}
	return { action: "missionRoomStatus", missionId: mission.id };
}

module.exports = { mergeCourt, nextForIssue };
