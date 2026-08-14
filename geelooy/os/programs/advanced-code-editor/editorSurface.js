//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file editorSurface.js
 * @description
 * The Awtsmoos renews the visible vessel while secure speech waits behind the veil;
 * Awtsmoos.com shapes host, iframe, file, and error so each responsibility can prevail.
 * These helpers contain DOM and path presentation, leaving bridge timing elsewhere.
 */

/** Creates the DOM host that Geelooy OS places inside its window. */
export function createEditorRoot() {
	const root = document.createElement("section");
	root.className = "awtsmoos-program-host advanced-code-editor-shell";
	return root;
}

/** Creates the secure Apps Code iframe without binding a message endpoint. */
export function createEditorIframe(configuration, title) {
	const iframe = document.createElement("iframe");
	iframe.className = "awtsmoos-program-frame";
	iframe.src = configuration.url;
	iframe.title = title;
	iframe.setAttribute("sandbox", configuration.sandbox);
	iframe.allow = configuration.allow;
	iframe.referrerPolicy = "strict-origin";
	return iframe;
}

/** Creates the initial file payload consumed by the secure VFS bridge. */
export function createInitialEditorFile(options = {}) {
	const basePath = normalizeBasePath(options.path);
	const fileName = options.fileName || options.title || "Untitled";
	return {
		basePath,
		fileName,
		title: options.title || fileName,
		intent: options.intent || "edit",
		content: contentText(options.content),
		path: joinPath(basePath, fileName)
	};
}

/** Replaces a failed editor iframe with one bounded accessible error panel. */
export function revealEditorError(root, iframe, error) {
	if (iframe) {
		iframe.src = "about:blank";
	}
	root.replaceChildren(createErrorPanel(error?.message || error));
}

/** Returns a static program shell for pre-iframe configuration failures. */
export function createStaticEditorProgram(root) {
	return {
		div: root,
		init() {},
		onclose() {}
	};
}

/** Creates an accessible error message inside the editor window. */
export function createErrorPanel(message = "Embedded editor unavailable") {
	const panel = document.createElement("div");
	panel.className = "advanced-code-editor-error";
	panel.setAttribute("role", "alert");
	panel.textContent = message;
	return panel;
}

function contentText(content) {
	return typeof content === "string"
		? content
		: content?.content ?? JSON.stringify(content || "", null, 2);
}

function normalizeBasePath(path = "/") {
	return String(path || "/").startsWith("awtsmoos://")
		? path
		: `/${String(path || "/").replace(/^\/+/, "")}`;
}

function joinPath(path, name = "") {
	if (!name) {
		return path;
	}
	if (String(path).startsWith("awtsmoos://")) {
		return `${path.replace(/\/+$/, "")}/${name}`;
	}
	return `/${[path, name].join("/").split("/").filter(Boolean).join("/")}`;
}
