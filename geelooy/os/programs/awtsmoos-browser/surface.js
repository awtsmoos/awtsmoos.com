//B"H
//Boruch Hashem
//Blessed is He

/**
 * Builds the host chrome around a Merkava-rendered page. The Awtsmoos creates
 * toolbar, inspector, editor, and GPU stage anew; Awtsmoos.com keeps host controls
 * visibly separate from all guest pixels and guest-produced text.
 */
export function createBrowserSurface(documentObject = document) {
	const root = element(documentObject, "section", "awtsmoos-browser-host");
	const toolbar = element(documentObject, "header", "awtsmoos-browser-toolbar");
	const brand = element(documentObject, "strong", "awtsmoos-browser-brand", "Merkava Browser");
	const address = element(documentObject, "input", "awtsmoos-browser-address");
	address.type = "text";
	address.value = "merkava://welcome";
	address.setAttribute("aria-label", "Virtual address");
	const renderButton = button(documentObject, "Render", "render");
	const selfHostButton = button(documentObject, "Self-host", "self-host");
	const depth = element(documentObject, "input", "awtsmoos-browser-depth");
	depth.type = "number"; depth.min = "0"; depth.max = "6"; depth.value = "3";
	depth.setAttribute("aria-label", "Self-host depth");
	toolbar.append(brand, address, renderButton, selfHostButton, depth);

	const body = element(documentObject, "div", "awtsmoos-browser-body");
	const editorPanel = element(documentObject, "aside", "awtsmoos-browser-editor-panel");
	const editorTitle = element(documentObject, "div", "awtsmoos-browser-panel-title", "Guest HTML + CSS");
	const editor = element(documentObject, "textarea", "awtsmoos-browser-editor");
	editor.spellcheck = false;
	const boundary = element(documentObject, "p", "awtsmoos-browser-boundary", "Custom JavaScript is disabled until the Merkava bytecode VM is connected. No iframe or eval is used.");
	editorPanel.append(editorTitle, editor, boundary);

	const viewportPanel = element(documentObject, "main", "awtsmoos-browser-viewport-panel");
	const stage = element(documentObject, "div", "awtsmoos-browser-stage");
	const glCanvas = element(documentObject, "canvas", "awtsmoos-browser-gl");
	const textCanvas = element(documentObject, "canvas", "awtsmoos-browser-text");
	stage.append(glCanvas, textCanvas);
	const metrics = element(documentObject, "pre", "awtsmoos-browser-metrics", "Loading Merkava runtime…");
	viewportPanel.append(stage, metrics);
	body.append(editorPanel, viewportPanel);
	root.append(toolbar, body);
	return { address, body, boundary, depth, editor, glCanvas, metrics, renderButton, root, selfHostButton, stage, textCanvas };
}

function button(documentObject, label, action) {
	const value = element(documentObject, "button", "awtsmoos-browser-button", label);
	value.type = "button";
	value.dataset.action = action;
	return value;
}

function element(documentObject, tagName, className, text = "") {
	const value = documentObject.createElement(tagName);
	value.className = className;
	if (text) value.textContent = text;
	return value;
}
