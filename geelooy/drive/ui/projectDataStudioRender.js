//B"H
//Boruch Hashem
//Blessed be He
/**
 * @module ProjectDataStudioRender
 * @description Renders bounded documents, field inference, and generated API code using text-only DOM operations.
 */

import { actionButton, createElement } from "./dom.js";
import { filterStudioDocuments, inferStudioSchema, studioValuePreview } from "./projectDataStudioModel.js";

/** @param {HTMLElement} container Document navigator. @param {Array<object>} documents Documents. @param {string} term Filter. @param {Function} select Selection callback. */
export function renderStudioDocuments(container, documents, term, select) {
	const matches = filterStudioDocuments(documents, term);
	container.replaceChildren(...matches.map(document => {
		const button = actionButton(document.key, () => select(document), { className: "project-data-document" });
		button.append(createElement("span", { text: studioValuePreview(document.value) }));
		return button;
	}));
	if (!matches.length) container.append(createElement("p", { className: "project-data-empty", text: "No loaded documents match this filter." }));
}

/** @param {HTMLElement} container Grid vessel. @param {Array<object>} documents Bounded documents. @param {Function} select Selection callback. */
export function renderStudioTable(container, documents, select) {
	const columns = topColumns(documents);
	const table = createElement("table", { className: "project-data-table" });
	const head = createElement("tr", { children: [createElement("th", { text: "Key" }), ...columns.map(name => createElement("th", { text: name }))] });
	const body = documents.map(document => {
		const values = record(document.value);
		const row = createElement("tr", {
			children: [createElement("td", { text: document.key }), ...columns.map(name => createElement("td", { text: studioValuePreview(values[name]) }))]
		});
		row.tabIndex = 0;
		row.addEventListener("click", () => select(document));
		row.addEventListener("keydown", event => {
			if (event.key === "Enter") select(document);
		});
		return row;
	});
	table.append(createElement("thead", { children: [head] }), createElement("tbody", { children: body }));
	container.replaceChildren(table);
}

/** @param {HTMLElement} container Schema vessel. @param {Array<object>} documents Bounded documents. */
export function renderStudioSchema(container, documents) {
	const schema = inferStudioSchema(documents);
	container.replaceChildren(...schema.map(field => createElement("div", {
		className: "project-data-schema-row",
		children: [
			createElement("strong", { text: field.name }),
			createElement("span", { text: field.types.join(" · ") }),
			createElement("small", { text: `${field.count}/${documents.length} docs` })
		]
	})));
	if (!schema.length) container.append(createElement("p", { className: "project-data-empty", text: "Load object documents to infer a schema." }));
}

/** @param {HTMLElement} pre Code vessel. @param {string} source Code source. */
export function renderStudioApi(pre, source) {
	pre.textContent = source;
}

/** @param {Array<object>} documents Documents. @returns {Array<string>} Frequent top-level columns. */
function topColumns(documents) {
	const counts = new Map();
	for (const document of documents) for (const name of Object.keys(record(document.value))) counts.set(name, (counts.get(name) || 0) + 1);
	return [...counts].sort((left, right) => counts.get(right) - counts.get(left)).slice(0, 6);
}

/** @param {unknown} value Candidate object. @returns {object} Safe record or empty record. */
function record(value) {
	return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
