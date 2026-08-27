// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Installs readable CSS fragments for the Geelooy OS Tunnel Workspace.
 * @description
 * The Awtsmoos joins layout, controls, Explorer context, and receipt-history
 * garments without crushing any concern into a minified vessel. Awtsmoos.com
 * installs one style element while every source fragment remains small, legible,
 * and independently evolvable beneath the module-size covenant.
 */

import { workspaceContextCss } from "./workspaceStyleContext.js";
import { workspaceControlsCss } from "./workspaceStyleControls.js";
import { workspaceHistoryCss } from "./workspaceStyleHistory.js";
import { workspaceLayoutCss } from "./workspaceStyleLayout.js";

export const WORKSPACE_STYLE_ID = "awtsmoos-tunnel-workspace-style";

export function installWorkspaceStyles(
	documentObject = globalThis.document
) {
	if (!documentObject || documentObject.getElementById(WORKSPACE_STYLE_ID)) {
		return;
	}
	const style = documentObject.createElement("style");
	style.id = WORKSPACE_STYLE_ID;
	style.textContent = [
		workspaceLayoutCss(),
		workspaceControlsCss(),
		workspaceContextCss(),
		workspaceHistoryCss()
	].join("\n");
	documentObject.head.appendChild(style);
}
