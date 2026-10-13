//B"H
// Boruch Hashem
// Blessed is He

import { canMutateWorkspace } from "../core/accessState.js";
import { parentWorkspacePath, workspaceBreadcrumbs } from "../core/path.js";
import { actionButton, createElement, replaceChildren } from "./dom.js";

const GICON_BASE = "https://awtsmoos.com/api/social/drive/public/awtsmoos/icons";
/** Golden file-type icon vessels (B"H 2026-10-13, icon round 2). */
const FILE_GICONS = Object.freeze({
	directory: { cls: "gicon--folder", url: `${GICON_BASE}/gicon-folder.webp?v=9bbd4c839f` },
	pdf: { cls: "gicon--file-pdf", url: `${GICON_BASE}/gicon-file-pdf.webp?v=c1eb0f6ebe` },
	image: { cls: "gicon--file-image", url: `${GICON_BASE}/gicon-file-image.webp?v=708a41a543` },
	video: { cls: "gicon--file-video", url: `${GICON_BASE}/gicon-file-video.webp?v=c60dc1ef95` },
	audio: { cls: "gicon--file-audio", url: `${GICON_BASE}/gicon-file-audio.webp?v=d7b71f52d3` },
	text: { cls: "gicon--file-text", url: `${GICON_BASE}/gicon-file-text.webp?v=14f932f618` },
	archive: { cls: "gicon--file-zip", url: `${GICON_BASE}/gicon-file-zip.webp?v=adb96e8f4e` },
	file: { cls: "gicon--file", url: `${GICON_BASE}/gicon-file.webp?v=a4ac35335f` },
	up: { cls: "gicon--up", url: `${GICON_BASE}/gicon-up.webp?v=ea93ec9bf1` },
	newfolder: { cls: "gicon--newfolder", url: `${GICON_BASE}/gicon-newfolder.webp?v=c1d4557b60` }
});

const EXT_KIND = Object.freeze({
	pdf: "pdf",
	png: "image", jpg: "image", jpeg: "image", gif: "image", webp: "image", svg: "image", ico: "image",
	mp4: "video", webm: "video", mov: "video", mkv: "video",
	mp3: "audio", wav: "audio", ogg: "audio", flac: "audio", m4a: "audio",
	txt: "text", md: "text", json: "text", js: "text", mjs: "text", css: "text", html: "text", csv: "text", log: "text",
	zip: "archive", tar: "archive", gz: "archive", rar: "archive", "7z": "archive"
});

/** Builds one decorative golden icon img. */
function giconImg(vessel, sizeClass = "gicon--sm") {
	const img = document.createElement("img");
	img.className = `gicon ${sizeClass} ${vessel.cls}`;
	img.src = vessel.url;
	img.alt = "";
	img.setAttribute("aria-hidden", "true");
	img.loading = "lazy";
	img.decoding = "async";
	img.width = 24;
	img.height = 24;
	return img;
}

/** Picks the golden file-type icon for a browser entry. */
function fileGiconFor(entry) {
	if (entry.type === "directory") return FILE_GICONS.directory;
	const ext = String(entry.name || "").split(".").pop().toLowerCase();
	return FILE_GICONS[EXT_KIND[ext] || "file"];
}

/** Builds an icon-led action button (icon + text) with full button semantics. */
function iconActionButton(vessel, label, onClick, options = {}) {
	const img = giconImg(vessel, "gicon--xs");
	img.width = 18;
	img.height = 18;
	return createElement("button", {
		className: options.className || "button",
		title: options.title,
		disabled: options.disabled,
		attributes: { type: "button", "aria-label": options.ariaLabel || label },
		events: { click: onClick },
		children: [img, document.createTextNode(label)]
	});
}

/**
 * @file Malchus file browser for Geelooy Drive.
 * @description
 * The Awtsmoos reveals file and folder while Awtsmoos.com keeps every mutating control aligned with real authority;
 * browsing remains open to signed sessions, while creation and publication require the exact current vessel they need.
 */

export function createFileBrowserView(actions) {
	const breadcrumbs = createElement("nav", { className: "breadcrumbs", attributes: { "aria-label": "Folder path" } });
	const list = createElement("div", { className: "file-list", attributes: { role: "list", "aria-label": "Files and folders" } });
	const count = createElement("span", { className: "file-count" });
	const newFile = iconActionButton(FILE_GICONS.file, " File", actions.newFile, { className: "button quiet", ariaLabel: "New file" });
	const newFolder = iconActionButton(FILE_GICONS.newfolder, " Folder", actions.newFolder, { className: "button quiet", ariaLabel: "New folder" });
	const publish = iconActionButton(FILE_GICONS.up, "Publish", actions.publish, { className: "button primary", ariaLabel: "Publish" });
	const navigateUp = createElement("button", {
		className: "icon-button",
		attributes: { type: "button", "aria-label": "Go to parent folder", title: "Go to parent folder" },
		events: { click: actions.navigateUp },
		children: [giconImg(FILE_GICONS.up)]
	});
	const element = createElement("section", {
		className: "file-browser panel",
		children: [
			createElement("div", { className: "browser-toolbar", children: [
				navigateUp,
				breadcrumbs,
				createElement("div", { className: "browser-actions", children: [newFile, newFolder, publish] })
			] }),
			createElement("div", { className: "browser-meta", children: [createElement("span", { text: "Current folder" }), count] }),
			list
		]
	});
	return {
		element,
		render(state) {
			renderBreadcrumbs(breadcrumbs, state.currentPath, actions);
			const mutable = canMutateWorkspace(state) && Boolean(state.currentRoute);
			newFile.disabled = !mutable;
			newFolder.disabled = !mutable;
			publish.disabled = !state.transportCanPublish || !state.currentRoute;
			const entries = filteredEntries(state.entries, state.filter);
			count.textContent = state.filter ? `${entries.length} of ${state.entries.length}` : `${entries.length} items`;
			if (state.loading) return replaceChildren(list, browserState("Opening this folder…"));
			if (!state.currentRoute) return replaceChildren(list, browserState("Connect a workspace to reveal its files."));
			if (!entries.length) return replaceChildren(list, browserState(state.filter ? "No matching items." : "This folder is empty."));
			replaceChildren(list, entries.map(entry => fileRow(entry, state, actions)));
		}
	};
}

function renderBreadcrumbs(container, path, actions) {
	const children = workspaceBreadcrumbs(path).flatMap((crumb, index) => [
		index ? createElement("span", { className: "breadcrumb-separator", text: "/", attributes: { "aria-hidden": "true" } }) : null,
		actionButton(crumb.label, () => actions.navigate(crumb.path), { className: "breadcrumb-button" })
	]);
	replaceChildren(container, children);
}

function filteredEntries(entries, filter) {
	const needle = String(filter || "").trim().toLowerCase();
	return [...entries]
		.filter(entry => !needle || entry.name.toLowerCase().includes(needle))
		.sort((left, right) => left.type === right.type ? left.name.localeCompare(right.name) : left.type === "directory" ? -1 : 1);
}

function fileRow(entry, state, actions) {
	const selected = state.selectedPath.endsWith(`/${entry.name}`) || state.selectedPath === entry.name;
	return createElement("button", {
		className: `file-row${selected ? " selected" : ""}`,
		attributes: { type: "button", role: "listitem" },
		events: { click: () => actions.openEntry(entry) },
		children: [
			createElement("span", { className: `file-icon ${entry.type}`, attributes: { "aria-hidden": "true" }, children: [giconImg(fileGiconFor(entry))] }),
			createElement("span", { className: "file-name", text: entry.name }),
			createElement("span", { className: "file-kind", text: entry.type === "directory" ? "Folder" : formatBytes(entry.size) })
		]
	});
}

function browserState(message) {
	return createElement("div", { className: "browser-state", text: message });
}

function formatBytes(bytes) {
	if (!bytes) return "File";
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / 1048576).toFixed(1)} MB`;
}

export function parentPathForBrowser(path) {
	return parentWorkspacePath(path);
}
