//B"H
//Boruch Hashem
//Blessed is He

import { formatBytes, hexPreview } from "./format.js";

/**
 * Renders cloned memory-region metadata and bounded search/read controls. The
 * Awtsmoos creates guest byte and exact address anew; Awtsmoos.com never hands the
 * UI a mutable emulator buffer.
 */
export function renderMemoryPanel(panel, process, state = {}) {
	panel.replaceChildren();
	const documentObject = panel.ownerDocument || document;
	if (!process) {
		panel.appendChild(empty(documentObject, "Select a process to inspect memory."));
		return;
	}
	panel.appendChild(searchControls(documentObject, state));
	const regions = process.telemetry?.memory?.regions || [];
	const cards = documentObject.createElement("div");
	cards.className = "task-manager-memory-grid";
	for (const region of regions) {
		cards.appendChild(regionCard(documentObject, region));
	}
	panel.appendChild(cards);
	if (state.error) {
		panel.appendChild(empty(documentObject, state.error));
	}
	if (state.results?.length) {
		panel.appendChild(resultList(documentObject, state.results));
	}
	if (state.read) {
		panel.appendChild(readPreview(documentObject, state.read));
	}
}

function searchControls(documentObject, state) {
	const form = documentObject.createElement("form");
	form.className = "task-manager-memory-search";
	form.dataset.action = "memory-search";
	const mode = documentObject.createElement("select");
	mode.name = "mode";
	for (const value of ["utf8", "hex"]) {
		const option = documentObject.createElement("option");
		option.value = value;
		option.textContent = value.toUpperCase();
		option.selected = state.mode === value;
		mode.appendChild(option);
	}
	const query = documentObject.createElement("input");
	query.name = "query";
	query.placeholder = "Search memory";
	query.value = state.query || "";
	const submit = documentObject.createElement("button");
	submit.type = "submit";
	submit.textContent = "Search";
	form.append(mode, query, submit);
	return form;
}

function regionCard(documentObject, region) {
	const card = documentObject.createElement("article");
	card.className = "task-manager-memory-card";
	const title = documentObject.createElement("strong");
	title.textContent = region.name;
	const details = documentObject.createElement("span");
	details.textContent = `${region.base}–${region.end} · ${formatBytes(region.byteLength)} · ${region.permissions}`;
	const inspect = documentObject.createElement("button");
	inspect.type = "button";
	inspect.textContent = "Read";
	inspect.dataset.action = "memory-read";
	inspect.dataset.regionId = region.id;
	card.append(title, details, inspect);
	return card;
}

function resultList(documentObject, results) {
	const section = documentObject.createElement("section");
	section.className = "task-manager-memory-results";
	for (const result of results) {
		const line = documentObject.createElement("div");
		line.textContent = `${result.address} · ${result.regionName}`;
		section.appendChild(line);
	}
	return section;
}

function readPreview(documentObject, read) {
	const pre = documentObject.createElement("pre");
	pre.className = "task-manager-memory-preview";
	pre.textContent = `${read.address}\n${hexPreview(read.bytes)}`;
	return pre;
}

function empty(documentObject, text) {
	const value = documentObject.createElement("p");
	value.className = "task-manager-empty";
	value.textContent = text;
	return value;
}
