// B"H

import { $ } from "../../ui/dom.js";
import { renderList, renderRoom, setStatus } from "./render.js";
import { templateGoal } from "./templates.js";
import { replayStep, replayLive } from "./replay.js";
import { setReview } from "./review.js";

export function bindControllerEvents(context, operations, signal) {
	const root = $("roomLobby")?.closest?.("[data-pane='missionRooms']") || document;
	root.addEventListener("click", event => routeClick(event, context, operations), { signal });
	root.addEventListener("input", event => routeInput(event, context, operations), { signal });
	root.addEventListener("change", event => routeChange(event, context, operations), { signal });
	document.addEventListener("visibilitychange", operations.visibility, { signal });
	document.addEventListener("awt:pane-change", event => {
		const active = event.detail?.pane === "missionRooms";
		const result = active ? operations.activate() : operations.suspend();
		Promise.resolve(result).catch(error => setStatus(error?.message || String(error)));
	}, { signal });
}

async function routeClick(event, context, operations) {
	const { state } = context;
	const id = event.target?.id || "";
	if (id === "createRoomBtn") return operations.createRoom();
	if (id === "discoverRoomsBtn") return operations.discover("manual");
	if (id === "refreshRoomBtn") return operations.refresh(false);
	if (id === "closeRoomBtn") return operations.closeRoom();
	if (id === "copyRoomLinkBtn") return operations.copyLink();
	if (id === "sendRoomMessageBtn") return sendAndRefresh(false, context, operations);
	if (id === "allowRoomContinueBtn") return sendAndRefresh(true, context, operations);
	if (id === "replayStartBtn") return replayStart(state);
	if (id === "replayPrevBtn") return replayMove(state, -1);
	if (id === "replayNextBtn") return replayMove(state, 1);
	if (id === "replayLiveBtn") return replayStop(state);
	if (id.startsWith("reviewApprove:")) return review(state, id, "approved");
	if (id.startsWith("reviewReject:")) return review(state, id, "rejected");
	if (id.startsWith("reviewChanges:")) return review(state, id, "changes-requested");
	const owner = event.target?.closest?.("[data-event-id]");
	const eventId = event.target?.dataset?.eventId || owner?.dataset?.eventId;
	if (!eventId) return;
	state.selectedEventId = eventId;
	renderRoom(state);
}

function routeInput(event, context, operations) {
	const { state } = context;
	if (event.target?.id === "roomSearch") {
		state.search = event.target.value || "";
		renderList(state, { join: operations.join });
	}
	if (event.target?.id === "roomEventSearch") {
		state.eventSearch = event.target.value || "";
		renderRoom(state);
	}
}

function routeChange(event, context, operations) {
	const { state } = context;
	if (event.target?.id === "roomFilter") {
		state.filter = event.target.value || "all";
		renderList(state, { join: operations.join });
	}
	if (event.target?.id !== "roomTemplateSelect") return;
	state.selectedTemplate = event.target.value || "";
	const goal = templateGoal(state.selectedTemplate);
	if (goal && $("newRoomGoal")) $("newRoomGoal").value = goal;
}

async function sendAndRefresh(allow, context, operations) {
	const got = await operations.send(allow);
	context.store.setSelected(got);
	return operations.refresh(true);
}

function replayStart(state) {
	state.replayEnabled = true;
	state.replayPlaying = true;
	state.replayIndex = 0;
	clearInterval(state.replayTimer);
	state.replayTimer = setInterval(() => {
		replayStep(state, 1);
		if ((state.replayIndex || 0) >= (state.events || []).length - 1) {
			clearInterval(state.replayTimer);
			state.replayPlaying = false;
		}
		renderRoom(state);
	}, 900);
	renderRoom(state);
}

function replayMove(state, delta) {
	clearInterval(state.replayTimer);
	state.replayPlaying = false;
	replayStep(state, delta);
	renderRoom(state);
}

function replayStop(state) {
	clearInterval(state.replayTimer);
	replayLive(state);
	renderRoom(state);
}

function review(state, id, status) {
	setReview(state, id.split(":").slice(1).join(":"), status);
	renderRoom(state);
}
