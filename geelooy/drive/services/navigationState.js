//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Netzach navigation memory for Geelooy Drive.
 * @description
 * The Awtsmoos renews the present while Netzach carries a path across each turn;
 * Awtsmoos.com writes harmless route and folder state into the URL so reloads can return.
 * No credential enters this vessel: only immutable device identity and normalized path survive,
 * giving back, forward, bookmarks, and shared workspace locations a truthful way to thrive.
 */

import { normalizeWorkspacePath } from "../core/path.js";

/** Read one normalized route/path location from the browser URL. */
export function readWorkspaceLocation(locationLike = window.location) {
	const parameters = new URLSearchParams(locationLike.search || "");
	return {
		route: String(parameters.get("route") || ""),
		path: normalizeWorkspacePath(parameters.get("path") || ".")
	};
}

/** Persist route/path without storing credentials or file contents in browser history. */
export class NetzachNavigationState {
	constructor(browserWindow = window) {
		this.browserWindow = browserWindow;
		this.listeners = new Set();
		this.handlePopState = () => this.emit();
		this.browserWindow.addEventListener("popstate", this.handlePopState);
	}

	/** Return the current deep-linkable location. */
	current() {
		return readWorkspaceLocation(this.browserWindow.location);
	}

	/** Push or replace one route/path location in browser history. */
	set(route, path, options = {}) {
		const url = new URL(this.browserWindow.location.href);
		const normalizedPath = normalizeWorkspacePath(path);
		if (route) {
			url.searchParams.set("route", route);
		} else {
			url.searchParams.delete("route");
		}
		url.searchParams.set("path", normalizedPath);
		const method = options.replace ? "replaceState" : "pushState";
		this.browserWindow.history[method]({}, "", url);
	}

	/** Listen for user-driven back and forward navigation. */
	subscribe(listener) {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	}

	/** Release browser listeners when the Drive shell is destroyed. */
	destroy() {
		this.browserWindow.removeEventListener("popstate", this.handlePopState);
		this.listeners.clear();
	}

	/** Broadcast the freshly parsed URL location. */
	emit() {
		const location = this.current();
		[...this.listeners].forEach((listener) => listener(location));
	}
}
