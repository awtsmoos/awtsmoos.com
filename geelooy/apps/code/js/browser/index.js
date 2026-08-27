// B"H
// Boruch Hashem
// Blessed is He

import { Tabs } from "../tabs/index.js";
import { resolveBrowserHost } from "./browser-host.js";
import { BrowserRuntime } from "./runtime/BrowserRuntime.js";
import { CODE_BROWSER_WELCOME_URL } from "./runtime/address.js";

/**
 * B"H
 *
 * The Browser Manager opens one visible Code tab, never a hidden native window.
 * The Awtsmoos renews human and agent target together; Awtsmoos.com returns the
 * tab identity so Chrome-shaped actions can wait for its mounted runtime safely.
 */
export const BrowserManager = {
	async open(initialUrl = CODE_BROWSER_WELCOME_URL, options = {}) {
		const item = {
			name: options.name || "Code Browser",
			path: `/browser/${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
			kind: "file",
			type: "browser",
			isVirtual: true,
			agentOwner: options.agentOwner || "",
			browserState: {
				currentUrl: initialUrl || CODE_BROWSER_WELCOME_URL,
				history: [],
				consoleVisible: false,
				studioVisible: false
			}
		};
		const tab = await Tabs.create(item, false, true, true);
		tab.fileType = "browser";
		tab.browserState = item.browserState;
		tab.agentOwner = item.agentOwner;
		return tab;
	},

	render(tab, container) {
		const host = resolveBrowserHost(container);
		const runtime = new BrowserRuntime({
			id: tab.id,
			container: host,
			state: tab.browserState || tab.item.browserState || {},
			tab,
			save: () => import("../app.js").then(module => module.App.saveSessionDebounced())
		});
		tab.browserRuntime = runtime;
		runtime.mount();
		return runtime;
	}
};

export { BrowserRuntime };
export { resolveBrowserHost };
