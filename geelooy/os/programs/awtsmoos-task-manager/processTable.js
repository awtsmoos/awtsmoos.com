//B"H
//Boruch Hashem
//Blessed is He

import { formatBytes } from "./format.js";

/**
 * Renders supervised Geelooy process rows and lifecycle controls. The Awtsmoos
 * creates every process generation anew; Awtsmoos.com exposes stop and restart only
 * through ProcessManager, never through host operating-system process authority.
 */
export function renderProcessTable(panel, processes, selectedPid, filter = "") {
	panel.replaceChildren();
	const documentObject = panel.ownerDocument || document;
	const table = documentObject.createElement("table");
	table.className = "task-manager-table";
	table.appendChild(headerRow(documentObject));
	const body = documentObject.createElement("tbody");
	const query = String(filter || "").toLowerCase();
	for (const process of processes.filter(item => matches(item, query))) {
		body.appendChild(processRow(documentObject, process, selectedPid));
	}
	table.appendChild(body);
	panel.appendChild(table);
}

function headerRow(documentObject) {
	const head = documentObject.createElement("thead");
	const row = documentObject.createElement("tr");
	const labels = ["Process", "PID", "State", "Memory", "Threads", "Network", "Actions"];
	for (const label of labels) {
		const cell = documentObject.createElement("th");
		cell.textContent = label;
		row.appendChild(cell);
	}
	head.appendChild(row);
	return head;
}

function processRow(documentObject, process, selectedPid) {
	const row = documentObject.createElement("tr");
	row.dataset.pid = process.pid;
	row.classList.toggle("is-selected", process.pid === selectedPid);
	const telemetry = process.telemetry || {};
	const latest = telemetry.resources?.latest || {};
	const values = [
		process.title,
		process.pid,
		`${process.status} · ${process.health}`,
		formatBytes(latest.memoryBytes),
		telemetry.threads?.threads?.length || 0,
		telemetry.network?.count || 0
	];
	for (const value of values) {
		row.appendChild(cell(documentObject, value));
	}
	const actions = documentObject.createElement("td");
	actions.append(
		actionButton(documentObject, "Inspect", "select-process", process.pid),
		actionButton(documentObject, "Stop", "stop-process", process.pid),
		actionButton(documentObject, "Restart", "restart-process", process.pid)
	);
	row.appendChild(actions);
	return row;
}

function actionButton(documentObject, label, action, pid) {
	const button = documentObject.createElement("button");
	button.type = "button";
	button.className = "task-manager-row-action";
	button.dataset.action = action;
	button.dataset.pid = pid;
	button.textContent = label;
	return button;
}

function cell(documentObject, value) {
	const element = documentObject.createElement("td");
	element.textContent = String(value ?? "");
	return element;
}

function matches(process, query) {
	const haystack = `${process.title} ${process.pid} ${process.app} ${process.status}`;
	return !query || haystack.toLowerCase().includes(query);
}
