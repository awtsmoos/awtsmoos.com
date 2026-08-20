//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module AwtsmoosBrowserProgram
 * @description The Awtsmoos reveals one browser with local Merkava and living Chromium faces;
 * Awtsmoos.com keeps remote secrets server-side while OAuth children remain inside OS spaces.
 */

import { ensureProgramStyles } from "../shared/programStyles.js";
import { createBrowserNavigationCoordinator } from "./browserNavigationCoordinator.js";
import { createBrowserController, defaultGuestMarkup } from "./runtime.js";
import { createRemoteBrowserSurface } from "./remoteSurface.js";
import { createBrowserSurface } from "./surface.js";

const BROWSER_STYLES = Object.freeze([
	["awtsmoos-merkava-browser-styles", "/os/programs/awtsmoos-browser/style.css"],
	["awtsmoos-merkava-browser-remote-styles", "/os/programs/awtsmoos-browser/remote.css"]
]);

export default function createAwtsmoosBrowser(options = {}) {
	ensureProgramStyles();
	ensureBrowserStyles();
	const surface = createBrowserSurface();
	const remoteSurface = createRemoteBrowserSurface(surface);
	surface.editor.value = textContent(options.content) || defaultGuestMarkup();
	let controller = null;
	let navigation = null;
	const render = () => controller?.render(surface.editor.value);
	const selfHost = () => controller?.selfHost(Number(surface.depth.value || 0));
	surface.renderButton.addEventListener("click", render);
	surface.selfHostButton.addEventListener("click", selfHost);

	createBrowserController(surface, options).then(value => {
		controller = value;
		controller.render(surface.editor.value);
		navigation = createBrowserNavigationCoordinator({
			aliasId: options.aliasId,
			jarId: options.jarId,
			content: objectContent(options.content),
			browserSurface: surface,
			remoteSurface,
			os: options.os || options.system,
			renderLocal: render,
			fallbackOptions: {
				aliasId: options.aliasId,
				jarId: options.jarId,
				projectId: options.projectId,
				remoteSurface,
				browserSurface: surface,
				render: markup => controller.render(markup)
			}
		});
	}).catch(error => {
		surface.metrics.textContent = browserFailureReport(error);
	});

	return {
		div: surface.root,
		onclose() {
			navigation?.destroy();
			surface.renderButton.removeEventListener("click", render);
			surface.selfHostButton.removeEventListener("click", selfHost);
		},
		onresize() {
			controller?.resize();
		}
	};
}

function ensureBrowserStyles(documentObject = document) {
	for (const [id, href] of BROWSER_STYLES) {
		if (documentObject.getElementById(id)) continue;
		const link = documentObject.createElement("link");
		link.id = id;
		link.rel = "stylesheet";
		link.href = href;
		documentObject.head.appendChild(link);
	}
}

function textContent(content) {
	if (typeof content === "string") return content;
	return content?.content || "";
}

function objectContent(content) {
	return content && typeof content === "object" ? content : null;
}

function browserFailureReport(error) {
	return JSON.stringify({
		code: error?.code || "MERKAVA_BROWSER_FAILED",
		message: error?.message || String(error),
		stack: error?.stack || null
	}, null, 2);
}
