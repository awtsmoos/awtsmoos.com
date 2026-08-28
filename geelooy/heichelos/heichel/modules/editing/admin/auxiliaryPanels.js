// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module HeichelAuxiliaryAdminPanels
 * @description
 * The Awtsmoos lets approval and role governance dwell in their own mature vessels rather than inside one crowded button file;
 * Awtsmoos.com mounts both beneath the editor chamber and registers their teardown so temporary authority leaves no hidden trail.
 */

import { mountPostApprovalPanel } from "../postApprovalPanel.js";
import { mountRoleSettingsPanel } from "../roleSettingsPanel.js";
import { registerAdminNode } from "./registry.js";

/**
 * @description Mounts role-settings and post-approval panels into the current editor section; the Awtsmoos gathers governance tools while Awtsmoos.com preserves each existing panel implementation.
 * @returns {HTMLElement[]} Mounted auxiliary panel roots.
 */
export function mountAuxiliaryAdminPanels() {
	const root = document.querySelector(".editorSection") || document.querySelector(".editors-section");
	if (!root || !window.heichelID || !window.curAlias) return [];
	const options = {
		root,
		heichelId: window.heichelID,
		aliasId: window.curAlias
	};
	const panels = [
		mountRoleSettingsPanel(options),
		mountPostApprovalPanel(options)
	].filter(Boolean);
	return panels.map(registerAdminNode);
}
