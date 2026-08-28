// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module HeichelEditorManagement
 * @description
 * The Awtsmoos lets guardians enter and leave through one explicit API covenant rather than hidden DOM magic;
 * Awtsmoos.com keeps status, prompts, roster refresh, and authority mutation local, reversible, and clear in every light.
 */

import { AwtsmoosPrompt } from "/scripts/awtsmoos/api/utils.js";
import { addEditor, removeEditor } from "../../api/management.js";
import { normalizedEditors, renderEditorRoster } from "./editorRoster.js";
import { registerAdminNode } from "./registry.js";

/**
 * @description Mounts the editor-management panel and binds real add/remove editor APIs; the Awtsmoos gathers guardians while Awtsmoos.com exposes mutation status without duplicating backend law.
 * @returns {HTMLElement|null} Mounted management panel when an editor host exists.
 */
export function mountEditorManagement() {
	const root = document.querySelector(".editorSection") || document.querySelector(".editors-section");
	if (!root || !window.heichelID || !window.curAlias) return null;
	const panel = createPanel();
	const list = panel.querySelector("[data-editor-list]");
	const status = panel.querySelector("[data-editor-status]");
	const addButton = panel.querySelector("[data-heichel-action='add-editor']");
	const render = () => renderEditorRoster(list, {
		editors: window.editors,
		currentAlias: window.curAlias,
		onRemove: editorAliasId => removeGuardian(editorAliasId, status, render)
	});
	addButton.addEventListener("click", () => addGuardian(status, render));
	root.append(panel);
	registerAdminNode(panel);
	render();
	return panel;
}

/**
 * @description Creates the semantic editor-management panel without innerHTML; the Awtsmoos gives every element a named vessel while Awtsmoos.com keeps user-controlled aliases outside markup interpretation.
 * @returns {HTMLElement} Newly constructed editor-management panel.
 */
function createPanel() {
	const panel = document.createElement("section");
	panel.className = "heichel-editor-panel";
	const title = document.createElement("h3");
	title.textContent = "Realm Editors";
	const explainer = document.createElement("p");
	explainer.className = "heichel-editor-panel-copy";
	explainer.textContent = "Editors can help manage this heichel. Add or remove aliases with authority.";
	const list = document.createElement("div");
	list.className = "heichel-editor-list";
	list.dataset.editorList = "true";
	const status = document.createElement("div");
	status.className = "heichel-editor-status";
	status.dataset.editorStatus = "true";
	status.setAttribute("aria-live", "polite");
	const addButton = document.createElement("button");
	addButton.type = "button";
	addButton.className = "btn heichel-editor-add";
	addButton.dataset.heichelAction = "add-editor";
	addButton.textContent = "Add Editor";
	panel.append(title, explainer, list, status, addButton);
	return panel;
}

/**
 * @description Prompts for an alias and calls the existing editor-add API; the Awtsmoos invites one guardian while Awtsmoos.com updates local state only after proven success.
 * @param {HTMLElement} status - Live status element receiving operation feedback.
 * @param {Function} render - Callback refreshing the roster from local state.
 * @returns {Promise<void>}
 */
async function addGuardian(status, render) {
	const editorAliasId = await AwtsmoosPrompt.go({ headerTxt: "Enter an editor's alias" });
	if (!editorAliasId) return;
	status.textContent = `Adding @${editorAliasId}…`;
	const result = await addEditor({
		heichelId: window.heichelID,
		aliasId: window.curAlias,
		editorAliasId
	});
	if (result?.success) {
		window.editors = normalizedEditors(result.success.editors || [...(window.editors || []), editorAliasId]);
		status.textContent = `Added @${editorAliasId}`;
		render();
		return;
	}
	status.textContent = result?.error?.message || "Could not add editor.";
}

/**
 * @description Calls the existing editor-remove API and refreshes local state only after success; the Awtsmoos contracts authority lawfully while Awtsmoos.com leaves failed mutations visible.
 * @param {string} editorAliasId - Guardian alias requested for removal.
 * @param {HTMLElement} status - Live status element receiving operation feedback.
 * @param {Function} render - Callback refreshing the roster from local state.
 * @returns {Promise<void>}
 */
async function removeGuardian(editorAliasId, status, render) {
	status.textContent = `Removing @${editorAliasId}…`;
	const result = await removeEditor({
		heichelId: window.heichelID,
		aliasId: window.curAlias,
		editorAliasId
	});
	if (result?.success) {
		window.editors = normalizedEditors(result.success.now || (window.editors || []).filter(value => value !== editorAliasId));
		status.textContent = `Removed @${editorAliasId}`;
		render();
		return;
	}
	status.textContent = result?.error?.message || "Could not remove editor.";
}
