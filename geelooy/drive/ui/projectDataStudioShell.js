//B"H
//Boruch Hashem
//Blessed be He
/**
 * @module ProjectDataStudioShell
 * @description Builds Database Studio tabs, toolbars, workspace framing, and identity helpers without owning database authority.
 */

import { actionButton, createElement } from "./dom.js";

const VIEWS = Object.freeze([
	["table", "Table"],
	["document", "Document"],
	["schema", "Schema"],
	["health", "Health"],
	["api", "API"]
]);

/** @param {object} vessels Named view elements. @returns {{element:HTMLElement,show:Function}} Tabbed content controller. */
export function createStudioPanels(vessels) {
	const tabs = createElement("div", { className: "project-data-tabs", attributes: { role: "tablist" } });
	const content = createElement("div", { className: "project-data-content" });
	const panels = new Map();
	for (const [id, label] of VIEWS) {
		const panel = createElement("section", { className: `project-data-view project-data-view-${id}` });
		panel.append(vessels[id]);
		panels.set(id, panel);
		const button = actionButton(label, () => show(id), { className: "project-data-tab" });
		button.dataset.view = id;
		button.setAttribute("role", "tab");
		tabs.append(button);
		content.append(panel);
	}
	const element = createElement("div", { className: "project-data-main", children: [tabs, content] });
	show("table");
	return { element, show };

	function show(id) {
		for (const [viewId, panel] of panels) panel.hidden = viewId !== id;
		for (const button of tabs.querySelectorAll("button")) {
			const active = button.dataset.view === id;
			button.classList.toggle("active", active);
			button.setAttribute("aria-selected", String(active));
		}
	}
}

/** @param {object} options Toolbar dependencies. @returns {HTMLElement} Mutation and navigation controls. */
export function createStudioToolbar(options) {
	const { controller, fields, editor, onCopy } = options;
	return createElement("div", {
		className: "project-data-actions project-data-toolbar",
		children: [
			actionButton("Refresh collection", () => run(controller.listDocuments), { className: "button primary" }),
			actionButton("Read document", () => run(controller.readKey)),
			actionButton("New document", () => {
				fields.key.value = "";
				editor.value = "{}";
				fields.key.input.focus();
			}),
			actionButton("Save JSON", () => run(controller.saveKey)),
			actionButton("Delete", () => run(controller.deleteKey), { className: "button danger" }),
			actionButton("Copy API", onCopy)
		]
	});
}

/** @param {HTMLElement} explorer Left document rail. @param {object} panels Tabbed main content. @returns {HTMLElement} Studio split workspace. */
export function createStudioWorkspace(explorer, panels) {
	return createElement("div", {
		className: "project-data-workspace",
		children: [createElement("aside", { className: "project-data-explorer", children: [explorer] }), panels.element]
	});
}

/** @param {object} fields Studio identity fields. @returns {object} Plain current identity. */
export function studioIdentity(fields) {
	return { alias: fields.alias.value, project: fields.project.value, path: fields.path.value, key: fields.key.value };
}

/** @param {object} fields Studio fields. @param {object} identity Canonical identity hints. */
export function setStudioIdentity(fields, identity = {}) {
	if (!fields.alias.value && identity.alias) fields.alias.value = identity.alias;
	if (!fields.project.value && identity.project) fields.project.value = identity.project;
}

/** @param {HTMLElement} element Status vessel. @param {string} message Human message. @param {string} tone Tone name. */
export function setStudioStatus(element, message, tone = "") {
	element.textContent = message;
	element.dataset.tone = tone;
}

/** @param {Function} task Async action. @returns {Promise<void>} Settled UI action. */
async function run(task) {
	await task();
}
