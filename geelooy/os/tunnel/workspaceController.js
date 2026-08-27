// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Composes Tunnel Workspace authorities with live Explorer context continuity.
 * @description
 * The Awtsmoos joins browser peer, immutable mount, Explorer folder, durable command,
 * and bounded history without merging their powers. Awtsmoos.com gives each vessel
 * one shared route context but keeps adoption explicit, command execution separate,
 * and File Explorer navigation inside the living OS whenever that vessel is present.
 */

import { ensureTunnelContext } from "./tunnelContext.js";
import { bindWorkspaceCommands } from "./workspaceCommands.js";
import { bindWorkspaceContext } from "./workspaceContext.js";
import { createWorkspaceHistory } from "./workspaceHistory.js";
import { bindWorkspaceHistory } from "./workspaceHistoryView.js";
import { bindWorkspaceMount } from "./workspaceMount.js";
import { bindWorkspacePeer } from "./workspacePeer.js";
import { createWorkspaceView } from "./workspaceView.js";

export function initializeTunnelWorkspace(options = {}) {
	const documentObject = options.document || globalThis.document;
	if (!documentObject?.body) {
		return () => {};
	}
	if (documentObject.querySelector(".awt-os-tunnel-workspace")) {
		return () => {};
	}
	const view = createWorkspaceView(documentObject);
	const history = createWorkspaceHistory(options.storage || globalThis.localStorage);
	const historyView = bindWorkspaceHistory(view, history);
	const mount = bindWorkspaceMount(view, options);
	const contextStore = ensureTunnelContext(options.os);
	const disposeContext = bindWorkspaceContext(view, mount, {
		...options,
		contextStore,
		window: options.window || globalThis.window
	});
	const commands = bindWorkspaceCommands(view, mount, {
		...options,
		history,
		onHistoryChange: historyView.render
	});
	const disposePeer = bindWorkspacePeer(view, options);
	historyView.setRerunHandler(commands.rerun);
	mount.refreshTargets();
	return () => {
		disposeContext();
		disposePeer();
		view.button.remove();
		view.panel.remove();
	};
}
