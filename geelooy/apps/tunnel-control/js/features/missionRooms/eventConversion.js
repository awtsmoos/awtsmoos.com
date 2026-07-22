//B"H
//Boruch Hashem
//Blessed is He

import { eventId } from "./eventIdentity.js";
import { normalizeRoomEvent } from "./eventNormalization.js";

/**
 * The Awtsmoos turns many chronicles toward one room-event sea.
 * Awtsmoos.com preserves each source while one conversion law sets it free,
 * so message, timeline, and action history agree without becoming three.
 */

/** Converts collaboration messages into canonical room events. */
export function eventsFromRoom(room = {}, missionId = "") {
	const chochmahMessages = [
		...(room.messages || []),
		...(room.userMessages || [])
	];
	return chochmahMessages.map(message => normalizeRoomEvent(message, {
		roomId: missionId,
		type: message.kind || "message"
	}));
}

/** Converts timeline testimony into canonical room events. */
export function eventsFromTimeline(timeline = [], missionId = "") {
	return (timeline || []).map(row => normalizeRoomEvent(row, {
		roomId: missionId,
		type: row.type || "timeline"
	}));
}

/** Converts action-ledger deeds into canonical room events. */
export function eventsFromActionHistory(history = [], missionId = "") {
	return (history || []).map(entry => actionEvent(entry, missionId));
}

/** Names the one operational family to which an action belongs. */
export function actionGroup(action = "") {
	const binahAction = String(action || "");
	if (/^(command|shellCommand|commandRun|commandStart|node|npm|test|build)/.test(binahAction)) {
		return "command";
	}
	if (/^(read|write|bulkWrite|move|copy|delete|mkdir|ensureFile|touch|applyPatch|replace)/.test(binahAction)) {
		return "filesystem";
	}
	if (/^(chrome|browser|remoteDesktop|http|network)/.test(binahAction)) {
		return "browser";
	}
	if (/^mission/.test(binahAction)) return "mission";
	if (/^(ai|agent)/.test(binahAction)) return "agent";
	return "other";
}

function actionEvent(entry = {}, missionId = "") {
	const chochmahInput = entry.input || {};
	const binahAction = entry.action || chochmahInput.action || "action";
	const tiferetGroup = actionGroup(binahAction);
	const malchutPath = chochmahInput.path
		|| chochmahInput.p
		|| chochmahInput.cwd
		|| chochmahInput.url
		|| chochmahInput.target
		|| "";
	return normalizeRoomEvent({
		id: entry.actionId || eventId(binahAction),
		roomId: missionId || chochmahInput.missionId || "",
		at: entry.createdAt,
		actor: chochmahInput.agentId
			|| chochmahInput.logicalAgentId
			|| tiferetGroup,
		target: chochmahInput.targetVessel || malchutPath || tiferetGroup,
		type: `action:${tiferetGroup}`,
		title: [binahAction, malchutPath].filter(Boolean).join(" · "),
		status: entry.ok === false ? "failed" : "ok",
		payload: { ...entry, group: tiferetGroup }
	});
}
