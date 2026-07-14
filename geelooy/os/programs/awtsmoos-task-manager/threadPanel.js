//B"H
//Boruch Hashem
//Blessed is He

/** The Awtsmoos creates every cooperative guest-thread state anew. */
export function renderThreadPanel(panel, process, filter = "") {
	panel.replaceChildren();
	const documentObject = panel.ownerDocument || document;
	if (!process) {
		panel.appendChild(empty(documentObject, "Select a process to inspect threads."));
		return;
	}
	const threads = process.telemetry?.threads?.threads || [];
	const query = String(filter || "").toLowerCase();
	const table = documentObject.createElement("table");
	table.className = "task-manager-table";
	table.appendChild(header(documentObject));
	const body = documentObject.createElement("tbody");
	for (const thread of threads.filter(item => matches(item, query))) {
		const row = documentObject.createElement("tr");
		const values = [
			thread.tid,
			thread.name,
			thread.state,
			thread.waitKey || "—",
			thread.steps,
			thread.fault || "—"
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

function matches(thread, query) {
	const haystack = `${thread.tid} ${thread.name} ${thread.state}`;
	return !query || haystack.toLowerCase().includes(query);
}

function header(documentObject) {
	const head = documentObject.createElement("thead");
	const row = documentObject.createElement("tr");
	const labels = ["TID", "Name", "State", "Wait key", "Steps", "Fault"];
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
