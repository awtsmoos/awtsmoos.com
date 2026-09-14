// B"H
// Boruch Hashem
// Blessed is He

import { availableAgents, availableTeams } from "./recipientRouting.js";

/** Builds the searchable selected-agent checkbox field without owning transport. */
export function selectedChoices(state, refresh) {
	const root = element("div", "awt-room-recipient-choices");
	const search = element("input");
	search.type = "search";
	search.placeholder = "Search agents…";
	search.setAttribute("aria-label", "Search Mission Control agents");
	search.value = state.recipientSearch || "";
	search.addEventListener("input", () => {
		state.recipientSearch = search.value;
		refresh();
	});
	const buttons = element("div", "button-row");
	buttons.append(
		button("Select all", () => {
			state.recipientAgents = filteredAgents(state).map(agent => agent.agentId);
			refresh();
		}),
		button("Clear", () => {
			state.recipientAgents = [];
			refresh();
		})
	);
	const list = element("div", "awt-room-recipient-agent-list");
	for (const agent of filteredAgents(state)) list.append(agentCheckbox(state, agent, refresh));
	if (!list.childNodes.length) list.append(element("small", "", "No matching agents."));
	root.append(search, buttons, list);
	return root;
}

export function oneChoice(state, refresh) {
	const select = element("select");
	select.setAttribute("aria-label", "Choose one Mission Control agent");
	select.append(option("", "Choose one agent…"));
	for (const agent of availableAgents(state)) {
		select.append(option(agent.agentId, `${agent.name} · ${agent.status}`));
	}
	select.value = state.recipientOne || "";
	select.addEventListener("change", () => {
		state.recipientOne = select.value;
		refresh();
	});
	return select;
}

export function teamChoice(state, refresh) {
	const select = element("select");
	select.setAttribute("aria-label", "Choose Mission Control team");
	select.append(option("", "Choose a team…"));
	for (const team of availableTeams(state)) select.append(option(team, team));
	select.value = state.recipientTeam || "";
	select.addEventListener("change", () => {
		state.recipientTeam = select.value;
		refresh();
	});
	return select;
}

function filteredAgents(state) {
	const query = String(state.recipientSearch || "").trim().toLowerCase();
	return availableAgents(state).filter(agent => !query ||
		`${agent.agentId} ${agent.name} ${agent.status}`.toLowerCase().includes(query));
}

function agentCheckbox(state, agent, refresh) {
	const label = element("label", "awt-room-recipient-agent");
	const input = element("input");
	input.type = "checkbox";
	input.checked = state.recipientAgents.includes(agent.agentId);
	input.addEventListener("change", () => {
		const next = new Set(state.recipientAgents);
		input.checked ? next.add(agent.agentId) : next.delete(agent.agentId);
		state.recipientAgents = [...next];
		refresh();
	});
	label.append(input, document.createTextNode(` ${agent.name} · ${agent.status}`));
	return label;
}

function button(text, onClick) {
	const node = element("button", "", text);
	node.type = "button";
	node.addEventListener("click", onClick);
	return node;
}

function option(value, text) {
	const node = element("option", "", text);
	node.value = value;
	return node;
}

function element(tag, className = "", text = "") {
	const node = document.createElement(tag);
	if (className) node.className = className;
	if (text) node.textContent = text;
	return node;
}
