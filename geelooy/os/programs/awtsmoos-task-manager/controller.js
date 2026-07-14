//B"H
//Boruch Hashem
//Blessed is He

import { renderMemoryPanel } from "./memoryPanel.js";
import { renderNetworkPanel } from "./networkPanel.js";
import { renderProcessTable } from "./processTable.js";
import { renderThreadPanel } from "./threadPanel.js";
/**
 * Connects Task Manager to ProcessManager subscriptions and bounded debugger calls.
 * The Awtsmoos creates each lifecycle event anew; Awtsmoos.com renders fresh
 * snapshots without polling storms or trusting process-controlled markup.
 */
export function createTaskManagerController(surface, manager) {
	const state = {
		activeTab: "processes",
		memory: {},
		selectedPid: null
	};
	const refresh = () => render(surface, manager, state);
	const unsubscribe = manager?.subscribe?.(refresh) || (() => {});
	const click = event => handleClick(event, manager, state, refresh);
	const submit = event => handleSubmit(event, manager, state, refresh);
	surface.root.addEventListener("click", click);
	surface.root.addEventListener("submit", submit);
	surface.filter.addEventListener("input", refresh);
	refresh();
	return {
		close() {
			unsubscribe();
			surface.root.removeEventListener("click", click);
			surface.root.removeEventListener("submit", submit);
		},
		refresh,
		state
	};
}
function render(surface, manager, state) {
	const processes = manager?.list?.() || [];
	const selectedExists = state.selectedPid
		&& manager?.get?.(state.selectedPid);
	if (!selectedExists) {
		state.selectedPid = processes[0]?.pid || null;
	}
	const selected = state.selectedPid
		? manager?.get?.(state.selectedPid)
		: null;
	const filter = surface.filter.value;
	renderProcessTable(
		surface.panels.processes,
		processes,
		state.selectedPid,
		filter
	);
	renderThreadPanel(surface.panels.threads, selected, filter);
	renderNetworkPanel(surface.panels.network, selected, filter);
	renderMemoryPanel(surface.panels.memory, selected, state.memory);
	for (const [name, panel] of Object.entries(surface.panels)) {
		panel.hidden = name !== state.activeTab;
	}
	for (const [name, button] of Object.entries(surface.tabButtons)) {
		button.classList.toggle("is-active", name === state.activeTab);
	}
	surface.status.textContent = `${processes.length} processes · selected ${selected?.title || "none"}`;
}

function handleClick(event, manager, state, refresh) {
	const target = event.target.closest?.("[data-action]");
	if (!target) {
		return;
	}
	const action = target.dataset.action;
	if (action === "refresh") {
		refresh();
		return;
	}
	if (action === "tab") {
		state.activeTab = target.dataset.tab;
	}
	if (action === "select-process") {
		state.selectedPid = target.dataset.pid;
	}
	if (action === "stop-process") {
		manager?.stop?.(target.dataset.pid, "task-manager", 0);
	}
	if (action === "restart-process") {
		manager?.restart?.(target.dataset.pid, { force: true });
	}
	if (action === "memory-read" && state.selectedPid) {
		state.memory.read = manager.readMemory(state.selectedPid, {
			length: 256,
			regionId: target.dataset.regionId
		});
		state.activeTab = "memory";
	}
	refresh();
}

function handleSubmit(event, manager, state, refresh) {
	if (event.target.dataset.action !== "memory-search") {
		return;
	}
	event.preventDefault();
	const data = new FormData(event.target);
	state.memory.mode = data.get("mode");
	state.memory.query = data.get("query");
	try {
		state.memory.results = manager.searchMemory(state.selectedPid, {
			limit: 200,
			mode: state.memory.mode,
			value: state.memory.query
		});
		state.memory.error = null;
	} catch (error) {
		state.memory.results = [];
		state.memory.error = error.message;
	}
	refresh();
}
