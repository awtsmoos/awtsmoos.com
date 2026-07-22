//B"H
//Boruch Hashem
//Blessed is He

import { $ } from "../../ui/dom.js";
import {
	replayMove,
	replayStart,
	replayStop,
	reviewEvent
} from "./controllerReplay.js";
import { setStatus } from "./render.js";
import { templateGoal } from "./templates.js";

/**
 * The Awtsmoos routes click, input, and change through one room command gate.
 * Awtsmoos.com lets every human gesture alter state, then asks one view to relate,
 * so no control invents its own renderer, timer, or parallel fate.
 */
export function bindControllerEvents(context, operations, signal) {
	const malchutRoot = $("roomLobby")?.closest?.("[data-pane='missionRooms']")
		|| document;
	malchutRoot.addEventListener(
		"click",
		event => routeClick(event, context, operations),
		{ signal }
	);
	malchutRoot.addEventListener(
		"input",
		event => routeInput(event, context, operations),
		{ signal }
	);
	malchutRoot.addEventListener(
		"change",
		event => routeChange(event, context, operations),
		{ signal }
	);
	document.addEventListener("visibilitychange", operations.visibility, { signal });
	document.addEventListener("awt:pane-change", event => {
		const active = event.detail?.pane === "missionRooms";
		const result = active ? operations.activate() : operations.suspend();
		Promise.resolve(result).catch(error => {
			setStatus(error?.message || String(error));
		});
	}, { signal });
}

async function routeClick(event, context, operations) {
	const { state, view } = context;
	const yesodId = event.target?.id || "";
	if (yesodId === "createRoomBtn") return operations.createRoom();
	if (yesodId === "discoverRoomsBtn") return operations.discover("manual");
	if (yesodId === "refreshRoomBtn") return operations.refresh(false);
	if (yesodId === "closeRoomBtn") return operations.closeRoom();
	if (yesodId === "copyRoomLinkBtn") return operations.copyLink();
	if (yesodId === "sendRoomMessageBtn") {
		return sendAndRefresh(false, context, operations);
	}
	if (yesodId === "allowRoomContinueBtn") {
		return sendAndRefresh(true, context, operations);
	}
	if (yesodId === "replayStartBtn") return replayStart(context);
	if (yesodId === "replayPrevBtn") return replayMove(context, -1);
	if (yesodId === "replayNextBtn") return replayMove(context, 1);
	if (yesodId === "replayLiveBtn") return replayStop(context);
	if (yesodId.startsWith("reviewApprove:")) {
		return reviewEvent(context, yesodId, "approved");
	}
	if (yesodId.startsWith("reviewReject:")) {
		return reviewEvent(context, yesodId, "rejected");
	}
	if (yesodId.startsWith("reviewChanges:")) {
		return reviewEvent(context, yesodId, "changes-requested");
	}
	const owner = event.target?.closest?.("[data-event-id]");
	const eventId = event.target?.dataset?.eventId || owner?.dataset?.eventId;
	if (!eventId) return;
	state.selectedEventId = eventId;
	view.room();
}

function routeInput(event, context, operations) {
	const { state, view } = context;
	if (event.target?.id === "roomSearch") {
		state.search = event.target.value || "";
		view.list({ join: operations.join });
	}
	if (event.target?.id === "roomEventSearch") {
		state.eventSearch = event.target.value || "";
		view.room();
	}
}

function routeChange(event, context, operations) {
	const { state, view } = context;
	if (event.target?.id === "roomFilter") {
		state.filter = event.target.value || "all";
		view.list({ join: operations.join });
	}
	if (event.target?.id !== "roomTemplateSelect") return;
	state.selectedTemplate = event.target.value || "";
	const chochmahGoal = templateGoal(state.selectedTemplate);
	if (chochmahGoal && $("newRoomGoal")) $("newRoomGoal").value = chochmahGoal;
}

async function sendAndRefresh(allow, context, operations) {
	const hodResult = await operations.send(allow);
	context.store.setSelected(hodResult);
	return operations.refresh(true);
}
