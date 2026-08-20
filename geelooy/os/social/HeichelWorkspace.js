// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Opens one social post file as an embedded Geelooy OS reading workspace.
 * @description
 * The Awtsmoos gives the document a chamber and the chrome its own vessel;
 * Awtsmoos.com keeps iframe reading, window identity, and truthful actions modular and inspectable.
 */
import { workspaceChrome } from "./HeichelWorkspaceChrome.js";

const STYLE_ID = "geelooy-social-workspace-styles";
const STYLE_HREF = "/geelooy/os/styles/revelation/social-workspace.css?v=social-workspace-003";

/**
 * Opens one social VFS post in a rich OS workspace.
 * @param {object} os Live Geelooy OS facade.
 * @param {object} item Normalized Explorer item.
 * @returns {object} Created OS window result.
 */
export function openHeichelWorkspace(os, item) {
	ensureStyles();
	const descriptor = item?.raw?.data || {};
	return os.addWindow({
		title: descriptor.title || item?.name || "Social Post",
		content: workspace(descriptor),
		path: item?.path || "/social",
		filePath: item?.path || "",
		os
	});
}

/** @param {object} item Normalized Explorer item. @returns {boolean} Social-post identity. */
export function isHeichelSocialPost(item) {
	const data = item?.raw?.data || {};
	return item?.kind === "file"
		&& data.provider === "social-heichel"
		&& data.kind === "post"
		&& Boolean(data.viewUrl);
}

function workspace(descriptor) {
	const root = node("section", "geelooy-social-workspace");
	root.append(...workspaceChrome(descriptor), frameShell(descriptor));
	return root;
}

function frameShell(descriptor) {
	const shell = node("div", "geelooy-social-workspace__frame-shell");
	const frame = document.createElement("iframe");
	frame.className = "geelooy-social-workspace__frame";
	frame.src = descriptor.viewUrl;
	frame.title = descriptor.title || "Embedded social post";
	frame.loading = "eager";
	frame.referrerPolicy = "same-origin";
	shell.append(frame);
	return shell;
}

function ensureStyles() {
	if (document.getElementById(STYLE_ID)) {
		return;
	}
	const link = document.createElement("link");
	link.id = STYLE_ID;
	link.rel = "stylesheet";
	link.href = STYLE_HREF;
	document.head.append(link);
}

function node(tag, className = "") {
	const element = document.createElement(tag);
	if (className) {
		element.className = className;
	}
	return element;
}
