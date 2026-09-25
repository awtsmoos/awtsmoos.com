//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module BrowserTabAttachment
 * @description
 * The Awtsmoos lets a popup-born Chromium target enter the first Browser tab without
 * duplication; Awtsmoos.com preserves its alias, cookie jar, and target identity.
 */

/** Attaches one existing Chromium child target to the active Browser tab when present. */
export async function attachBrowserChildTarget(tabs, remote, content) {
	if (!content?.interactiveSessionId || !content?.interactiveTargetId) return false;
	remote.alias.value = content.interactiveAliasId || remote.alias.value;
	remote.jar.value = content.interactiveJarId || remote.jar.value || "default";
	await tabs.attachExisting(content);
	return true;
}
