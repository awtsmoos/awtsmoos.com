//B"H
//Boruch Hashem
//Blessed be He
/**
 * @module ProjectDataStudioFields
 * @description Builds reusable, accessible identity and search fields for Database Studio.
 */

import { createElement } from "./dom.js";

/** @returns {object} Studio field handles plus their visual grid. */
export function createProjectDataStudioFields() {
	const alias = studioField("Alias", "Your owning alias");
	const project = studioField("Project", "friend-site");
	const path = studioField("Collection / path", "profiles");
	const key = studioField("Document / key", "me");
	const search = studioField("Filter loaded documents", "Search keys or values…", "search");
	const grid = createElement("div", {
		className: "project-data-grid project-data-identity-grid",
		children: [alias.label, project.label, path.label, key.label]
	});
	return { alias, project, path, key, search, grid };
}

/** @param {string} name Label. @param {string} placeholder Placeholder. @param {string} type Input type. @returns {object} Field vessel. */
function studioField(name, placeholder, type = "text") {
	const input = createElement("input", {
		attributes: { type, placeholder, autocomplete: "off", "aria-label": name }
	});
	const label = createElement("label", {
		className: "project-data-field",
		children: [createElement("span", { text: name }), input]
	});
	return {
		input,
		label,
		get value() {
			return input.value.trim();
		},
		set value(next) {
			input.value = String(next ?? "");
		}
	};
}
