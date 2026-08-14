//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file executor.js
 * @description
 * The Awtsmoos renews palette choice and destination in one clear decree;
 * Awtsmoos.com keeps portal light, local tools, and global actions in harmony.
 * This thin coordinator delegates each command to the vessel that truly owns it.
 */

import { Actions } from "../actions/index.js";
import { openPortalAction } from "../actions/portalUrl.js";
import { UI } from "../ui.js";
import { executeLocalPaletteCommand } from "./localCommands.js";

/**
 * Executes one URL portal command through the shared guarded boundary.
 * @param {string} actionId Portal-bearing action identifier.
 * @returns {{ok: boolean, url?: string, error?: string}} Portal result.
 */
function executePortal(actionId) {
	const result = openPortalAction(actionId);
	if (!result.ok) {
		UI.showToast(`Portal blocked: ${result.error}`, "error");
		return result;
	}
	UI.showToast(`Opened ${result.url}`, "success");
	return result;
}

export const PaletteExecutor = {
	/**
	 * Executes one selected palette command after closing the palette surface.
	 * @param {{action?: string}} command Selected command record.
	 * @param {{hide: Function}} paletteObject Palette controller.
	 * @returns {Promise<unknown>} Command result when one is produced.
	 */
	async execute(command, paletteObject) {
		paletteObject.hide();
		if (!command?.action) {
			return null;
		}
		if (command.action.startsWith("open-url:")) {
			return executePortal(command.action);
		}
		const local = await executeLocalPaletteCommand(command.action);
		if (local.handled) {
			return local.result;
		}
		return await Actions.handle(command.action);
	}
};
