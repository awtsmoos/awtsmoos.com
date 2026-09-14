//B"H
//Boruch Hashem
//Blessed be He
/**
 * @module ProjectDataQueryBuilder
 * @description
 * Turns the bounded project query API into a visual Mongo/Firebase-like filter bar.
 * Every predicate remains data, never executable source, and engine mode stays visible.
 */

import { actionButton, createElement } from "./dom.js";

const OPERATORS = Object.freeze([
	["eq", "="],
	["ne", "≠"],
	["gt", ">"],
	["gte", "≥"],
	["lt", "<"],
	["lte", "≤"],
	["contains", "contains"],
	["exists", "exists"]
]);

/**
 * Creates one visual query bar tied to current Studio alias/project/path fields.
 * @param {{fields:object,platformProvider:Function,onResults:Function,setStatus:Function}} options Query dependencies.
 * @returns {HTMLElement} Query Builder surface.
 */
export function createProjectDataQueryBuilder(options) {
	const field = input("Field", "profile.city");
	const value = input("Value", '"Brooklyn"');
	const operator = selectField("Operator", OPERATORS);
	const sort = selectField("Sort", [["", "None"], ["asc", "Ascending"], ["desc", "Descending"]]);
	const mode = createElement("span", { className: "project-query-mode", text: "Compatibility · bounded scan" });
	const run = async (offset = 0) => {
		try {
			options.setStatus("Running bounded query…", "");
			const result = await client(options).queryDocuments({
				path: options.fields.path.value,
				field: required(field.value, "Query field"),
				operator: operator.value,
				value: value.value,
				sort: sort.value,
				limit: 100,
				offset: Math.max(0, Number(offset) || 0)
			});
			const database = result.database || {};
			mode.textContent = executionLabel(database.execution);
			options.onResults(database.documents || [], database);
			options.setStatus(`${database.matched ?? 0} match(es) in the bounded preview.`, "success");
		} catch (error) {
			options.setStatus(error?.message || "Database query failed.", "error");
		}
	};
	const element = createElement("section", {
		className: "project-query-builder",
		children: [
			createElement("div", { className: "project-query-heading", children: [
				createElement("strong", { text: "Query Builder" }), mode
			] }),
			createElement("div", { className: "project-query-grid", children: [field.label, operator.label, value.label, sort.label] }),
			actionButton("Run query", () => run(0), { className: "button primary project-query-run" })
		]
	});
	element.runAtOffset = run;
	return element;
}

/** @param {object} options Query dependencies. @returns {object} Authenticated project client. */
function client(options) {
	const platform = options.platformProvider();
	if (!platform?.project) throw new Error("Project API is not available in this Drive session.");
	return platform.project(required(options.fields.alias.value, "Alias"), required(options.fields.project.value, "Project"));
}

/** @param {string} label Label. @param {string} placeholder Placeholder. @returns {object} Input field. */
function input(label, placeholder) {
	const control = createElement("input", { attributes: { placeholder, autocomplete: "off" } });
	return fieldVessel(label, control);
}

/** @param {string} label Label. @param {Array<Array<string>>} choices Options. @returns {object} Select field. */
function selectField(label, choices) {
	const control = createElement("select", {
		children: choices.map(([value, text]) => createElement("option", { text, attributes: { value } }))
	});
	return fieldVessel(label, control);
}

/** @param {string} label Label. @param {HTMLElement} control Input/select. @returns {object} Field vessel. */
function fieldVessel(label, control) {
	const element = createElement("label", { className: "project-data-field", children: [createElement("span", { text: label }), control] });
	return { label: element, get value() { return control.value.trim(); } };
}

/** @param {string} value Value. @param {string} label Label. @returns {string} Required value. */
function required(value, label) {
	if (!value) throw new TypeError(`${label} is required.`);
	return value;
}

/** @param {string} mode Server execution mode. @returns {string} Human evidence label. */
function executionLabel(mode) {
	return mode === "native-index" ? "Native · indexed" : "Compatibility · bounded scan";
}
