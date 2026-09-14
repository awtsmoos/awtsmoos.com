//B"H
//Boruch Hashem
//Blessed be He
/**
 * @module ProjectDataStudioChrome
 * @description Builds Database Studio title/editor chrome and copyable API actions outside the main orchestration vessel.
 */

import { createElement } from "./dom.js";
import { studioApiSnippet } from "./projectDataStudioModel.js";
import { setStudioStatus, studioIdentity } from "./projectDataStudioShell.js";

/** @param {HTMLElement} meta Collection evidence. @param {HTMLElement} engine Engine evidence. @returns {HTMLElement} Studio title. */
export function createStudioHeader(meta, engine) {
	return createElement("div", { className: "project-data-head", children: [
		createElement("div", { children: [
			createElement("p", { className: "platform-eyebrow", text: "DosDB · AwtsmoosDB" }),
			createElement("h3", { text: "Awtsmoos Database Studio" }),
			createElement("p", { text: "Browse collections, query documents, edit JSON, infer schema, and inspect the real project engine." })
		] }),
		createElement("div", { className: "project-data-head-evidence", children: [meta, engine] })
	] });
}

/** @returns {HTMLTextAreaElement} Strict JSON editor. */
export function createStudioJsonEditor() {
	return createElement("textarea", {
		className: "project-data-editor",
		attributes: { spellcheck: "false", "aria-label": "Project document JSON value" }
	});
}

/** @param {object} fields Studio fields. @param {HTMLElement} status Status vessel. @returns {Promise<void>} Clipboard result. */
export async function copyStudioApi(fields, status) {
	const source = studioApiSnippet(studioIdentity(fields));
	await navigator.clipboard?.writeText?.(source);
	setStudioStatus(status, "API example copied.", "success");
}
