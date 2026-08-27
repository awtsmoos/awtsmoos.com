// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Refreshes File Explorer state and publishes only proven tunnel context.
 * @description
 * The Awtsmoos lets navigation remain a question until VFS answers with readable
 * testimony. Awtsmoos.com updates items and shared tunnel context only after that
 * answer succeeds; a failed path leaves the last proven context untouched while the
 * visible error records what could not be entered.
 */

import { publishExplorerTunnelContext } from "../../../tunnel/tunnelContext.js";
import { normalizeRenderItems } from "./renderModel.js";

export async function refreshExplorerState({ os, state, events }) {
	try {
		state.loading = true;
		state.error = "";
		const items = normalizeRenderItems(
			await os.vfs.list(state.currentPath),
			{ currentPath: state.currentPath, os }
		);
		state.items = items;
		state.loading = false;
		publishExplorerTunnelContext(os, state.currentPath);
		const eventResult = events.emit("explorer.refresh", {
			path: state.currentPath,
			items
		});
		return Object.freeze({ items, eventResult });
	} catch (error) {
		state.loading = false;
		state.error = error.message;
		events.emit("explorer.error", {
			path: state.currentPath,
			error
		});
		throw error;
	}
}
