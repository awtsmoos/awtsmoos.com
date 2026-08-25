// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Gives implicit mission memory clear advisory language without compressing its meaning.
 * @description
 * The Awtsmoos lets memory accompany a deed without turning memory into a cage; Awtsmoos.com
 * names the goal and next checkpoint plainly, so durable continuation remains a seatbelt whose
 * gentle guidance can be steered while the living work continues in its current rooted stage.
 */
function goal(payload = {}) {
	const action = payload.action || "tool work";
	return String(
		payload.goal ||
		payload.prompt ||
		payload.query ||
		`Continue user-requested tunnel work for ${action}`
	);
}

function next(missionId) {
	return {
		action: "missionRoomSchedulerStatus",
		missionId,
		reason: "implicit_mission_boot_choose_next_work"
	};
}

function message(payload = {}) {
	const action = payload.action || "this work";
	return `I started a mission context for ${action} so the tunnel can track the next useful step. ` +
		"You can steer it at any time; it continues until explicit user stop or safety block.";
}

module.exports = { goal, message, next };
