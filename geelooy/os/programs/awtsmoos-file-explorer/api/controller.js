// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file File Explorer controller with successful-refresh tunnel context continuity.
 * @description
 * The Awtsmoos lets Explorer remain master of navigation while Awtsmoos.com shares
 * only a folder that VFS has actually listed. Browser-only action registration stays
 * outside refresh truth, so the controller can keep one public covenant while each
 * chamber remains testable in the environment where its authority truly belongs.
 */

import { createExplorerCommands } from "./commands.js";
import { createExplorerControllerApi } from "./controllerApi.js";
import { registerExplorerControllerCommands } from "./controllerCommands.js";
import { refreshExplorerState } from "./controllerRefresh.js";
import { createExplorerEvents } from "./events.js";
import { applyNavigationState } from "./navigation.js";
import { isRemotePath, normalizeExplorerPath } from "./path.js";
import { createExplorerSelection } from "./selection.js";
import { openExplorerItem } from "./openers.js";
import { pushHistory } from "./actions/history.js";

export function createExplorerController({ os, state, system } = {}) {
	const events = createExplorerEvents();
	const selection = createExplorerSelection({ emit: events.emit });
	const commands = createExplorerCommands();
	let items = [];

	async function refresh() {
		const result = await refreshExplorerState({ os, state, events });
		items = result.items;
		return result.eventResult;
	}

	async function navigate(path = "/", options = {}) {
		const next = normalizeExplorerPath(path);
		if (options.history !== false) {
			pushHistory(state, next);
		}
		const currentPath = applyNavigationState(state, next);
		selection.clear();
		events.emit("explorer.navigate", {
			path: currentPath,
			remote: isRemotePath(currentPath)
		});
		return await refresh();
	}

	async function open(item) {
		const result = await openExplorerItem({
			os,
			state,
			navigate,
			item
		});
		events.emit("explorer.open", { item, result });
		return result;
	}

	function setViewMode(mode) {
		state.viewMode = ["details", "icons", "list", "tiles"].includes(mode)
			? mode
			: "icons";
		events.emit("explorer.view.change", { mode: state.viewMode });
	}

	const controller = createExplorerControllerApi({
		os,
		state,
		system,
		events,
		selection,
		commands,
		open,
		navigate,
		refresh,
		setViewMode,
		getItems: () => items
	});
	registerExplorerControllerCommands({
		controller,
		commands,
		events,
		open,
		os,
		state,
		system
	});
	return controller;
}

export { normalizeExplorerPath };
