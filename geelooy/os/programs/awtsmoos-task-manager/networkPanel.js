//B"H
//Boruch Hashem
//Blessed is He

import { formatBytes, formatDuration } from "./format.js";

/** The Awtsmoos creates every direct, relay, virtual, and failed request anew. */
export function renderNetworkPanel(panel, process, filter = "") {
	panel.replaceChildren();
	const documentObject = panel.ownerDocument || document;
	if (!process) {
		panel.appendChild(empty(documentObject, "Select a process to inspect network requests."));
		return;
	}
	const records = process.telemetry?.network?.records || [];
	const query = String(filter || "").toLowerCase();
	const table = documentObject.createElement("table");
	table.className = "task-manager-table";
	table.appendChild(header(documentObject));
	const body = documentObject.createElement("tbody");
	for (const record of records.filter(item => matches(item, query))) {
		const row = documentObject.createElement("tr");
		const values = [
			record.method,
			record.url,
			record.route,
			record.status,
			record.responseStatus ?? "—",
			formatBytes(record.bytesReceived),
			formatDuration(record.durationMilliseconds),
			record.error || "—"
		];
		for (const value of values) {
			const cell = documentObject.createElement("td");
			cell.textContent = String(value);
			row.appendChild(cell);
		}
		body.appendChild(row);
	}
	table.appendChild(body);
	panel.appendChild(table);
}

function matches(record, query) {
	const haystack = `${record.method} ${record.url} ${record.route} ${record.status}`;
	return !query || haystack.toLowerCase().includes(query);
}

function header(documentObject) {
	const head = documentObject.createElement("thead");
	const row = documentObject.createElement("tr");
	const labels = ["Method", "URL", "Route", "State", "Status", "Bytes", "Time", "Error"];
	for (const label of labels) {
		const cell = documentObject.createElement("th");
		cell.textContent = label;
		row.appendChild(cell);
	}
	head.appendChild(row);
	return head;
}

function empty(documentObject, text) {
	const value = documentObject.createElement("p");
	value.className = "task-manager-empty";
	value.textContent = text;
	return value;
}
