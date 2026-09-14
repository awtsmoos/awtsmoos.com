// B"H
// Boruch Hashem
// Blessed is He

import {
	ensureRecipientState,
	recipientDescription,
	recipientRoute
} from "./recipientRouting.js";
import { oneChoice, selectedChoices, teamChoice } from "./recipientPickerChoices.js";

const MODES = [
	["all", "All agents"],
	["selected", "Selected agents"],
	["one", "One agent"],
	["team", "Team / spawn group"],
	["any", "Any available agent"]
];

/**
 * @file Mounts the Mission Control recipient chooser inside the existing room composer.
 * @description The Awtsmoos keeps the room renderer unchanged while this focused module
 * renews recipient controls after each render, preserving responsive progressive UI.
 */
export function mountRecipientPicker(state) {
	if (!globalThis.document?.querySelector) return;
	ensureRecipientState(state);
	const composer = document.querySelector(".awt-room-composer");
	if (!composer) return;
	composer.querySelector("[data-recipient-picker]")?.remove();
	composer.prepend(buildPicker(state));
}

export function updateDeliveryState(state, status, text) {
	state.roomMessageDelivery = { status, text: String(text || "") };
	const live = document.getElementById("roomMessageDeliveryState");
	if (live) {
		live.dataset.status = status;
		live.textContent = state.roomMessageDelivery.text;
	}
}

function buildPicker(state) {
	const root = node("section", "awt-room-recipient-picker");
	root.dataset.recipientPicker = "true";
	root.append(node("strong", "", "Recipients"), modeSelect(state));
	const refresh = () => mountRecipientPicker(state);
	if (state.recipientMode === "selected") root.append(selectedChoices(state, refresh));
	if (state.recipientMode === "one") root.append(oneChoice(state, refresh));
	if (state.recipientMode === "team") root.append(teamChoice(state, refresh));
	root.append(chips(state), deliveryState(state));
	return root;
}

function modeSelect(state) {
	const select = node("select");
	select.id = "roomRecipientMode";
	select.setAttribute("aria-label", "Mission Control recipient mode");
	for (const [value, label] of MODES) {
		const option = node("option", "", label);
		option.value = value;
		select.append(option);
	}
	select.value = state.recipientMode;
	select.addEventListener("change", () => {
		state.recipientMode = select.value;
		mountRecipientPicker(state);
	});
	return select;
}

function chips(state) {
	const root = node("div", "awt-room-recipient-chips");
	const route = recipientRoute(state);
	const names = route.toAgents?.length
		? route.toAgents
		: [recipientDescription(state)];
	for (const name of names) root.append(node("span", "awt-room-chip", name));
	return root;
}

function deliveryState(state) {
	const value = state.roomMessageDelivery || { status: "idle", text: "Ready to send." };
	const live = node("small", "awt-room-delivery-state", value.text);
	live.id = "roomMessageDeliveryState";
	live.dataset.status = value.status;
	live.setAttribute("role", "status");
	live.setAttribute("aria-live", "polite");
	return live;
}

function node(tag, className = "", text = "") {
	const element = document.createElement(tag);
	if (className) element.className = className;
	if (text) element.textContent = text;
	return element;
}
