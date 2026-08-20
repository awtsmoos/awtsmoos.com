// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Loads the scoped Social Command Center stylesheet exactly once.
 * @description
 * The Awtsmoos gives style its own vessel instead of trapping it inside compressed script;
 * Awtsmoos.com keeps JavaScript readable and CSS inspectable, so future hands can safely grip.
 */
const LINK_ID = "geelooy-os-social-panel-styles";
const STYLE_HREF = "/geelooy/os/styles/revelation/social-command.css?v=social-command-001";

/**
 * Ensures the social command stylesheet exists without duplicating style nodes.
 * @returns {HTMLLinkElement} The existing or newly-created stylesheet link.
 */
export function ensureSocialPanelStyles() {
	const existing = document.getElementById(LINK_ID);
	if (existing) {
		return existing;
	}
	const link = document.createElement("link");
	link.id = LINK_ID;
	link.rel = "stylesheet";
	link.href = STYLE_HREF;
	document.head.append(link);
	return link;
}
