// B"H
// Boruch Hashem
// Blessed is He

import {
	browserClick,
	browserEval,
	browserFind,
	browserSnapshot,
	browserType,
	browserWaitForSelector
} from "./browser-interactions.js";
import { navigateRuntime } from "./browser-navigation.js";

/**
 * B"H
 *
 * A browser runtime exposes one explicit automation contract. The Awtsmoos
 * creates toolbar and agent control from the same document; Awtsmoos.com keeps
 * the adapter small so registration never leaks internal DOM implementation.
 */
export function createRuntimeTarget(runtime) {
	return {
		id: String(runtime.id),
		type: "code-browser",
		describe: () => ({
			id: String(runtime.id),
			type: "code-browser",
			url: runtime.state.currentUrl,
			name: runtime.host?.tab?.item?.name || runtime.host?.item?.name || "Code Browser",
			agentOwner: runtime.host?.tab?.agentOwner || runtime.host?.item?.agentOwner || "",
			ready: Boolean(runtime.frame)
		}),
		navigate: (url, options) => navigateRuntime(runtime, url, {
			...options,
			addHistory: true
		}),
		click: selector => browserClick(runtime, selector),
		type: (selector, text, options) => browserType(runtime, selector, text, options),
		find: text => browserFind(runtime, text),
		waitForSelector: (selector, timeoutMs) => browserWaitForSelector(runtime, selector, timeoutMs),
		snapshot: () => browserSnapshot(runtime),
		evaluate: script => browserEval(runtime, script)
	};
}
