//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module AwtsmoosBrowserProgram
 * @description
 * Geelooy's trusted browser-window lifecycle. The live external page is not an
 * iframe: real Chromium runs behind authenticated server APIs while this module
 * owns only the host chrome, developer fallback, resize, and teardown covenant.
 */

import { ensureProgramStyles } from "../shared/programStyles.js";
import { startBrowserProgram } from "./browserProgramStartup.js";
import { defaultGuestMarkup } from "./runtime.js";
import { createRemoteBrowserSurface } from "./remoteSurface.js";
import { createBrowserSurface } from "./surface.js";

/**
 * Creates one Awtsmoos Browser application window.
 * @param {object} options Geelooy program launch options and optional initial URL.
 * @returns {object} Geelooy program contract containing DOM and lifecycle hooks.
 */
export default function createAwtsmoosBrowser(options = {}) {
	ensureProgramStyles();
	const surface = createBrowserSurface();
	const remoteSurface = createRemoteBrowserSurface(surface);
	surface.modeBadge.textContent = "Starting";
	surface.root.hidden = true;
	surface.editor.value = textContent(options.content) || defaultGuestMarkup();
	let runtime = null;
	const render = () => runtime?.controller?.render(surface.editor.value);
	const selfHost = () => runtime?.controller?.selfHost(Number(surface.depth.value || 0));
	surface.renderButton.addEventListener("click", render);
	surface.selfHostButton.addEventListener("click", selfHost);
	void startBrowserProgram(surface, remoteSurface, options, render)
		.then(result => runtime = result)
		.catch(error => revealStartupFailure(surface, remoteSurface, error))
		.finally(() => surface.root.hidden = false);
	return {
		div: surface.root,
		onclose() {
			runtime?.destroy();
			surface.renderButton.removeEventListener("click", render);
			surface.selfHostButton.removeEventListener("click", selfHost);
		},
		onresize() {
			runtime?.controller?.resize();
		}
	};
}

/** Returns authored fallback markup without treating structured session metadata as text. */
function textContent(content) {
	if (typeof content === "string") {
		return content;
	}
	return content?.content || "";
}

/** Reveals startup failure without allowing the whole OS window to disappear. */
function revealStartupFailure(surface, remoteSurface, error) {
	const code = error?.code || "AWTSMOOS_BROWSER_FAILED";
	const message = error?.message || String(error);
	surface.metrics.textContent = JSON.stringify({ code, message }, null, 2);
	surface.modeBadge.textContent = "Unavailable";
	remoteSurface.status.textContent = `${code} · ${message}`;
}
