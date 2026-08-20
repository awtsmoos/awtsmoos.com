//B"H
// Boruch Hashem
// Blessed is He

import { actionButton, createElement } from "./dom.js";
import { createProjectDataStudioController } from "./projectDataStudioController.js";
import { ensureProjectDataStudioTheme } from "./projectDataStudioTheme.js";

/**
 * @file Visual admin surface for one alias-owned project database.
 * @description
 * The Awtsmoos lets creator, alias, project, path, key, and JSON meet in a visible vessel;
 * Awtsmoos.com turns the bounded API into a Studio where authority is explicit and every mutation is level.
 */

export function createProjectDataStudio(platformProvider = () => globalThis.GeelooyPlatform) {
	ensureProjectDataStudioTheme();
	const fields = createFields();
	const editor = createElement("textarea", {
		className: "project-data-editor",
		attributes: { spellcheck: "false", "aria-label": "Project data JSON value" }
	});
	const keys = createElement("div", { className: "project-data-keys" });
	const status = createElement("p", {
		className: "project-data-status",
		attributes: { "aria-live": "polite" }
	});
	const controller = createProjectDataStudioController({
		fields,
		editor,
		platformProvider,
		renderKeys: (items, select) => renderKeys(keys, items, select),
		setStatus: (message, tone) => setStatus(status, message, tone)
	});
	const section = createElement("section", { className: "project-data-studio" });
	section.append(header(), fields.grid, actionBar(controller, status), keys, editor, status);
	return section;
}

function actionBar(controller, status) {
	const bar = createElement("div", { className: "project-data-actions" });
	const actions = [
		["List keys", controller.listKeys],
		["Read key", controller.readKey],
		["Save JSON", controller.saveKey],
		["Delete key", controller.deleteKey]
	];
	for (const [label, task] of actions) {
		bar.append(actionButton(label, () => run(task, status)));
	}
	return bar;
}

function createFields() {
	const alias = inputField("Alias", "Your owning alias");
	const project = inputField("Project", "friend-site");
	const path = inputField("Path", "profiles");
	const key = inputField("Key", "me");
	const grid = createElement("div", {
		className: "project-data-grid",
		children: [alias.label, project.label, path.label, key.label]
	});
	return { alias, project, path, key, grid };
}

function inputField(name, placeholder) {
	const input = createElement("input", { attributes: { placeholder, autocomplete: "off" } });
	const label = createElement("label", {
		className: "project-data-field",
		children: [createElement("span", { text: name }), input]
	});
	return {
		input,
		label,
		get value() { return input.value.trim(); },
		set value(next) { input.value = next; }
	};
}

function renderKeys(container, items, select) {
	container.replaceChildren(...items.map(item => actionButton(item, () => run(() => select(item), null), {
		className: "project-data-key"
	})));
	if (!items.length) container.append(createElement("span", { text: "No keys at this path yet." }));
}

async function run(task, status) {
	if (status) setStatus(status, "Working…", "");
	try {
		await task();
	} catch (error) {
		if (status) setStatus(status, error?.message || "Project data request failed.", "error");
	}
}

function setStatus(element, message, tone) {
	element.textContent = message;
	element.dataset.tone = tone;
}

function header() {
	return createElement("div", { className: "project-data-head", children: [
		createElement("div", { children: [
			createElement("h3", { text: "Project Data Studio" }),
			createElement("p", { text: "Browse and edit the authenticated project namespace. Values are JSON; listings and payloads are server-bounded." })
		] }),
		createElement("span", { className: "platform-badge", text: "API ready · Studio beta" })
	] });
}
