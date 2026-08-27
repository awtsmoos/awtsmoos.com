// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Binds shared Explorer tunnel context into Tunnel Workspace.
 * @description
 * The Awtsmoos lets one remote folder be seen by Files and commands without making
 * sight into action. Awtsmoos.com requires an explicit human click before Explorer
 * context becomes Workspace cwd, and exact immutable-route agreement before that
 * click may succeed. Revealing a path opens Files; it never grants new authority.
 */

import { remoteNetworkPath } from "../remote/remoteTunnelPaths.js";

export function bindWorkspaceContext(view, mount, options = {}) {
	const store = options.contextStore;
	let explorerContext = null;
	const unsubscribe = store?.subscribe?.(context => {
		explorerContext = context;
		renderExplorerContext(view, context);
	}) || (() => {});

	view.useExplorerButton?.addEventListener("click", async () => {
		if (!explorerContext) {
			setContextMessage(view, "No tunnel folder is active in File Explorer.", true);
			return;
		}
		const result = await mount.adoptExplorerContext(explorerContext);
		if (!result?.ok) {
			setContextMessage(view, result?.error || "Explorer context could not be adopted.", true);
			return;
		}
		setContextMessage(
			view,
			`Using ${explorerContext.path} as command cwd.`,
			false
		);
	});

	view.openDriveButton?.addEventListener("click", () => {
		const target = mount.getTarget();
		if (!target?.route) {
			setContextMessage(view, "Select a verified mounted route first.", true);
			return;
		}
		openExplorerPath(options.os, remoteNetworkPath(target.route), options.window);
	});

	view.revealCwdButton?.addEventListener("click", () => {
		const target = mount.getTarget();
		if (!target?.route) {
			setContextMessage(view, "Select a verified mounted route first.", true);
			return;
		}
		openExplorerPath(
			options.os,
			workspaceExplorerPath(target, mount.getState()),
			options.window
		);
	});

	return unsubscribe;
}

export function workspaceExplorerPath(target = {}, state = {}) {
	const cwd = String(state.cwd || ".");
	return remoteNetworkPath(target.route || "", cwd === "." ? "" : cwd);
}

export function openExplorerPath(os, path, windowObject = globalThis.window) {
	if (os?.addWindow) {
		return os.addWindow({
			title: `Files · ${path}`,
			path,
			os,
			programName: "awtsmoosFileExplorer"
		});
	}
	const origin = windowObject?.location?.origin || "https://awtsmoos.com";
	const url = new URL("/os/", origin);
	url.searchParams.set("openExplorer", path);
	windowObject?.location?.assign?.(`${url.pathname}${url.search}`);
	return null;
}

function renderExplorerContext(view, context) {
	view.useExplorerButton.disabled = !context;
	setContextMessage(
		view,
		context ? `Explorer · ${context.path}` : "No tunnel folder is active in File Explorer.",
		false
	);
}

function setContextMessage(view, text, error) {
	view.explorerContext.textContent = text;
	view.explorerContext.dataset.state = error ? "error" : "ok";
}
