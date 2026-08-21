// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Shapes the visible OS host and selected-file identity for embedded Awtsmoos Docs.
 * @description The Awtsmoos renews garment and content together; Awtsmoos.com keeps
 * DOM presentation separate from filesystem authority, so the frame may look rich
 * while the bridge still owns only one deliberately selected document path.
 */
export function createDocsRoot() {
	const root = document.createElement("section");
	root.className = "awtsmoos-program-host awtsmoos-docs-shell";
	return root;
}

/** Creates a non-navigated iframe so the secure bridge can bind before Docs announces readiness. */
export function createDocsIframe(configuration, title) {
	const iframe = document.createElement("iframe");
	iframe.className = "awtsmoos-program-frame";
	iframe.src = "about:blank";
	iframe.dataset.docsSource = configuration.url;
	iframe.title = title;
	iframe.setAttribute("sandbox", configuration.sandbox);
	iframe.allow = configuration.allow;
	iframe.referrerPolicy = "strict-origin";
	return iframe;
}

/** Creates the sole selected-file capability delivered to embedded Docs. */
export function createInitialDocsFile(options = {}) {
	const basePath = normalizeBasePath(options.path || "/");
	const fileName = options.fileName || options.title || "Untitled.awtdoc";
	return {
		basePath,
		fileName,
		path: joinPath(basePath, fileName),
		content: contentText(options.content),
		format: inferFormat(fileName)
	};
}

/** Replaces an unusable frame with an accessible error message. */
export function revealDocsError(root, iframe, error) {
	if (iframe) iframe.src = "about:blank";
	root.replaceChildren(createDocsErrorPanel(error?.message || error));
}

/** Creates a static window surface when secure embed configuration cannot be formed. */
export function createStaticDocsProgram(root) {
	return {
		div: root,
		init() {},
		onclose() {}
	};
}

/** Creates the visible failure vessel for an embedded document launch. */
export function createDocsErrorPanel(message = "Awtsmoos Docs is unavailable") {
	const panel = document.createElement("div");
	panel.className = "advanced-code-editor-error";
	panel.setAttribute("role", "alert");
	panel.textContent = String(message || "Awtsmoos Docs is unavailable");
	return panel;
}

function contentText(content) {
	return typeof content === "string"
		? content
		: content?.content ?? JSON.stringify(content || "", null, 2);
}

function normalizeBasePath(path) {
	return String(path).startsWith("awtsmoos://")
		? String(path).replace(/\/+$/, "")
		: `/${String(path).replace(/^\/+|\/+$/g, "")}`.replace(/\/$/, "") || "/";
}

function joinPath(basePath, fileName) {
	if (basePath.startsWith("awtsmoos://")) {
		return `${basePath.replace(/\/+$/, "")}/${fileName}`;
	}
	return `/${[basePath, fileName].join("/").split("/").filter(Boolean).join("/")}`;
}

function inferFormat(fileName) {
	const extension = String(fileName).split(".").pop()?.toLowerCase();
	if (["md", "markdown"].includes(extension)) return "markdown";
	if (["html", "htm"].includes(extension)) return "html";
	if (extension === "txt") return "text";
	if (extension === "docx") return "docx-import";
	return "awtdoc";
}
