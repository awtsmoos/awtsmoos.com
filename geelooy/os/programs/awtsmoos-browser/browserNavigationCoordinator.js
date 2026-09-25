//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module BrowserNavigationCoordinator
 * @description
 * The Awtsmoos lets one trusted toolbar reveal many independent browsing vessels;
 * Awtsmoos.com delegates every command to the active tab without merging their fate.
 */

import { ensureBrowserSessionAlias } from "./browserSessionIdentity.js";
import { bindBrowserNavigationControls } from "./browserNavigationBindings.js";
import { attachBrowserChildTarget } from "./browserTabAttachment.js";
import { clearActiveBrowserCookies } from "./browserTabCookies.js";
import { createBrowserTabController } from "./browserTabController.js";
import { createBrowserTabSession } from "./browserTabSession.js";

export function createBrowserNavigationCoordinator(options) {
	const remote = options.remoteSurface;
	const surface = options.browserSurface;
	remote.alias.value = options.aliasId || "";
	remote.jar.value = options.jarId || "default";
	const tabs = createBrowserTabController({
		browserSurface: surface,
		createSession,
		documentObject: surface.root.ownerDocument,
		newTabButton: surface.newTabButton,
		pagePanel: surface.viewport,
		remoteSurface: remote,
		tabList: surface.tabList
	});
	tabs.create();
	const disposeBindings = bindBrowserNavigationControls({
		clearJar,
		createTab,
		history,
		navigate,
		remote,
		surface,
		tabs
	});
	attachBrowserChildTarget(tabs, remote, options.content).catch(showError);
	return {
		destroy,
		get interactive() {
			return tabs.activeSession()?.interactive || null;
		},
		navigate,
		tabs
	};

	function createSession(tab, onChange) {
		return createBrowserTabSession({
			browserSurface: surface,
			engineMode: () => options.engineMode || "headless",
			fallbackOptions: options.fallbackOptions,
			onChange,
			os: options.os,
			remoteSurface: remote,
			renderFallback: options.fallbackOptions.render,
			tab
		});
	}

	function createTab() {
		try {
			const tab = tabs.create({ focus: true });
			surface.address.focus();
			return tab;
		} catch (error) {
			if (error?.code !== "BROWSER_TAB_LIMIT") throw error;
			remote.status.textContent = "Maximum 12 tabs reached";
			return null;
		}
	}

	async function navigate(value, behavior = {}) {
		const target = String(value || "").trim();
		if (!target) return null;
		await ensureBrowserSessionAlias(remote, message => remote.status.textContent = message);
		try {
			return await tabs.activeSession()?.navigate(target, behavior);
		} catch (error) {
			showError(error);
			throw error;
		}
	}

	async function history(direction) {
		try {
			return await tabs.activeSession()?.history(direction);
		} catch (error) {
			showError(error);
			throw error;
		}
	}

	async function clearJar() {
		try {
			return await clearActiveBrowserCookies(tabs, remote);
		} catch (error) {
			showError(error);
			throw error;
		}
	}

	function showError(error) {
		remote.status.textContent = error?.code || error?.message || "Browser navigation failed";
	}

	function destroy() {
		disposeBindings();
		tabs.destroy();
	}
}
