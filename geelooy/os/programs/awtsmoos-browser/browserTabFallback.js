//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module BrowserTabFallback
 * @description
 * The Awtsmoos lets each tab retain a private safe-HTML history when Chromium rests;
 * Awtsmoos.com reveals that fallback only for the active tab and hides sibling worlds.
 */

import { createRemoteNavigationController } from "./remoteNavigationController.js";
import { createTabRemoteFacade } from "./browserTabNavigationSupport.js";

/** Creates one tab-local safe-HTML fallback lifetime. */
export function createBrowserTabFallback(options) {
	const address = { value: options.tab.address };
	const remote = createTabRemoteFacade(options.remoteSurface);
	let active = false;
	let markup = "";
	const controller = createRemoteNavigationController({
		...options.fallbackOptions,
		browserSurface: { address, editor: { value: "" } },
		remoteSurface: remote,
		render: value => {
			markup = value;
			if (active) options.render(value);
		}
	});
	controller.destroy();
	return {
		address,
		destroy: () => controller.destroy(),
		history,
		navigate: value => controller.navigate(value),
		pause: () => active = false,
		remote,
		resume,
		syncIdentity
	};

	async function history(direction) {
		if (direction === "back") return controller.back();
		if (direction === "forward") return controller.forward();
		return controller.reload();
	}

	function resume() {
		active = true;
		if (markup) options.render(markup);
	}

	function syncIdentity(content = {}) {
		remote.alias.value = content.interactiveAliasId || options.remoteSurface.alias.value;
		remote.jar.value = content.interactiveJarId || options.remoteSurface.jar.value || "default";
	}
}
