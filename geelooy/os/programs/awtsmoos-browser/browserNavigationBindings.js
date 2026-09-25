//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module BrowserNavigationBindings
 * @description
 * The Awtsmoos lets pointer, keyboard, and omnibox intention enter through one small
 * gate; Awtsmoos.com keeps event lifecycle outside navigation/session orchestration.
 */

import { bindBrowserTabKeyboard } from "./browserTabKeyboard.js";

/** Binds trusted Browser controls to active-tab actions and returns one disposer. */
export function bindBrowserNavigationControls(options) {
	const listeners = [];
	const { remote, surface, tabs } = options;
	bind(remote.go, "click", () => settle(options.navigate(surface.address.value)));
	bind(remote.back, "click", () => settle(options.history("back")));
	bind(remote.forward, "click", () => settle(options.history("forward")));
	bind(remote.reload, "click", () => settle(options.history("reload")));
	bind(remote.clearJar, "click", () => settle(options.clearJar()));
	bind(surface.newTabButton, "click", options.createTab);
	bind(surface.address, "keydown", event => {
		if (event.key === "Enter") settle(options.navigate(surface.address.value));
	});
	const disposeKeyboard = bindBrowserTabKeyboard(surface.root, {
		close: () => tabs.close(tabs.activeTab()?.id),
		create: options.createTab,
		cycle: tabs.cycle
	});
	return () => {
		disposeKeyboard();
		for (const [target, type, handler] of listeners) {
			target.removeEventListener(type, handler);
		}
	};

	function bind(target, type, handler) {
		target.addEventListener(type, handler);
		listeners.push([target, type, handler]);
	}
}

function settle(promise) {
	promise?.catch?.(() => {});
}
