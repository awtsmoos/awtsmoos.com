// B"H
// Boruch Hashem
// Blessed is He

import { backRuntime } from "./browser-navigation.js";
import { CODE_BROWSER_WELCOME_URL } from "./address.js";
import { rememberCustomCode, runCustomHtml, runCustomJs } from "./customRunner.js";

/**
 * B"H
 *
 * Browser controls bind once to one runtime vessel. The Awtsmoos renews button,
 * address, studio, and console together; Awtsmoos.com keeps event wiring outside
 * the runtime coordinator so navigation and mounting remain independently tested.
 */
export function bindRuntimeNodes(runtime, root) {
	runtime.root = root;
	runtime.address = root.querySelector(".browser-runtime-address");
	runtime.frame = root.querySelector(".browser-runtime-frame");
	runtime.lines = root.querySelector(".browser-runtime-console-lines");
	runtime.htmlBox = root.querySelector(".browser-runtime-code");
	runtime.jsBox = root.querySelector(".browser-runtime-js");
	runtime.studio = root.querySelector(".browser-runtime-studio");
	runtime.statusLine = root.querySelector(".browser-runtime-status");
}

export function bindRuntimeEvents(runtime) {
	const root = runtime.root;
	root.querySelector('[data-action="go"]').onclick = () => void runtime.navigate(runtime.address.value);
	root.querySelector('[data-action="reload"]').onclick = () => void runtime.navigate(runtime.state.currentUrl, false);
	root.querySelector('[data-action="home"]').onclick = () => void runtime.navigate(CODE_BROWSER_WELCOME_URL);
	root.querySelector('[data-action="console"]').onclick = () => runtime.toggle("consoleVisible", "has-console");
	root.querySelector('[data-action="studio"]').onclick = () => runtime.toggleStudio();
	root.querySelector('[data-action="back"]').onclick = () => void backRuntime(runtime).catch(error => runtime.fail(error));
	root.querySelector('[data-action="run-html"]').onclick = () => runHtml(runtime);
	root.querySelector('[data-action="run-js"]').onclick = () => runJs(runtime);
	runtime.address.addEventListener("keydown", event => {
		if (event.key === "Enter") void runtime.navigate(runtime.address.value);
	});
}

export function runHtml(runtime) {
	rememberCustomCode(runtime.state, runtime.htmlBox, runtime.jsBox);
	runCustomHtml(runtime.frame, runtime.state.customHtml);
	runtime.log("html", "Custom HTML rendered.");
	runtime.save();
}

export function runJs(runtime) {
	rememberCustomCode(runtime.state, runtime.htmlBox, runtime.jsBox);
	runCustomJs(runtime.frame, runtime.lines, runtime.state.customJs);
	runtime.save();
}
