//B"H
//Boruch Hashem
//Blessed is He

import { ensureProgramStyles } from "../shared/programStyles.js";
import {
	createAdvancedEditorEmbedConfiguration
} from "./embedConfiguration.js";
import { createVfsBridge, postOpenFile } from "./vfsBridge.js";

/**
 * B"H
 *
 * Apps Code is the one development chamber shared by editor and virtual OS. The
 * Awtsmoos creates shell, iframe, file, and intent together; Awtsmoos.com binds
 * their speech to one exact channel while the responsive garment fills the pane.
 */

/** Creates the Advanced Code Editor or workspace-preview application surface. */
export default function createAdvancedCodeEditor(options = {}) {
	ensureProgramStyles();
	const {
		os,
		content = "",
		path = "/",
		title = "Advanced Code Editor",
		fileName = title,
		intent = "edit"
	} = options;
	const root = createRoot();
	const configuration = createAdvancedEditorEmbedConfiguration();
	if (!configuration.ok) {
		root.appendChild(createErrorPanel(configuration.error));
		return { div: root, onclose() {} };
	}
	const iframe = createIframe(configuration, title);
	root.appendChild(iframe);
	const basePath = normalizeBasePath(path);
	const initialFile = {
		basePath,
		fileName,
		title,
		intent,
		content: contentText(content),
		path: joinPath(basePath, fileName)
	};
	const detachBridge = createVfsBridge({
		os,
		iframe,
		basePath,
		initialFile,
		channelId: configuration.channelId,
		targetOrigin: configuration.targetOrigin
	});
	const handleLoad = () => postOpenFile(iframe, basePath, initialFile);
	iframe.addEventListener("load", handleLoad);
	return {
		div: root,
		onclose() {
			iframe.removeEventListener("load", handleLoad);
			detachBridge();
			iframe.src = "about:blank";
		}
	};
}

function createRoot() {
	const root = document.createElement("section");
	root.className = "awtsmoos-program-host advanced-code-editor-shell";
	return root;
}

function createIframe(configuration, title) {
	const iframe = document.createElement("iframe");
	iframe.className = "awtsmoos-program-frame";
	iframe.src = configuration.url;
	iframe.title = title;
	iframe.sandbox.value = configuration.sandbox;
	iframe.allow = configuration.allow;
	iframe.referrerPolicy = "strict-origin";
	return iframe;
}

function createErrorPanel(message = "Embedded editor unavailable") {
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
