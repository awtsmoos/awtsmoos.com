//B"H
// Boruch Hashem
// Blessed is He

import { canMutateWorkspace } from "../core/accessState.js";
import { parentWorkspacePath, workspaceBreadcrumbs } from "../core/path.js";
import { actionButton, createElement, replaceChildren } from "./dom.js";

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
	const newFile = actionButton("+ File", actions.newFile, { className: "button quiet" });
	const newFolder = actionButton("+ Folder", actions.newFolder, { className: "button quiet" });
	const publish = actionButton("Publish", actions.publish, { className: "button primary" });
	const element = createElement("section", {
		className: "file-browser panel",
		children: [
			createElement("div", { className: "browser-toolbar", children: [
				actionButton("↑", actions.navigateUp, { className: "icon-button", ariaLabel: "Go to parent folder" }),
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
			createElement("span", { className: `file-icon ${entry.type}`, text: entry.type === "directory" ? "▰" : "◇", attributes: { "aria-hidden": "true" } }),
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
