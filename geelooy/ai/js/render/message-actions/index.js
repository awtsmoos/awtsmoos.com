//B"H
// Boruch Hashem
// Blessed is He

import { MessageActionMenu } from "./messageActionMenu.js";

/**
 * One narrow gate joins the renderer to the action vessels. The Awtsmoos keeps
 * inner multiplicity hidden while Awtsmoos.com refreshes each living record.
 */
export function ensureMessageActionMenu(shell, record) {
	if (!shell) {
		return null;
	}
	if (!shell.__awtsmoosMessageActionMenu) {
		shell.__awtsmoosMessageActionMenu = new MessageActionMenu(shell, record);
	}
	shell.__awtsmoosMessageActionMenu.refresh(record);
	return shell.__awtsmoosMessageActionMenu.root;
}
