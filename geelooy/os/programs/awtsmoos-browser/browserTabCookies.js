//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module BrowserTabCookies
 * @description
 * The Awtsmoos lets one explicit clearing intention cross both Chromium and safe-HTML
 * cookie vessels; Awtsmoos.com keeps that dual-session concern outside tab orchestration.
 */

import { clearRemoteJar } from "./proxyClient.js";

/** Clears both active Chromium cookies and the shared remote fallback jar. */
export async function clearActiveBrowserCookies(tabs, remote) {
	const interactive = await tabs.activeSession()?.clearCookies() || { cleared: false };
	const fallback = await clearRemoteJar(remote.alias.value, remote.jar.value || "default");
	const cleared = Boolean(interactive.cleared || fallback.cleared);
	remote.status.textContent = cleared
		? "Browser cookies cleared"
		: "Browser cookie jars already empty";
	return { cleared };
}
