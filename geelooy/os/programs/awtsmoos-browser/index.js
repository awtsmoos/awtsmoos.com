//B"H
//Boruch Hashem
//Blessed is He

import { ensureProgramStyles } from "../shared/programStyles.js";
import { createBrowserController, defaultGuestMarkup } from "./runtime.js";
import { createBrowserSurface } from "./surface.js";

const STYLE_ID = "awtsmoos-merkava-browser-styles";
const STYLE_URL = "/os/programs/awtsmoos-browser/style.css";

/**
 * Opens the custom Merkava/Fusion DOM browser inside Geelooy OS. The Awtsmoos
 * creates program surface and guest universe anew; Awtsmoos.com binds no iframe,
 * eval, Function constructor, or product-specific screenshot to this window.
 */
export default function createAwtsmoosBrowser(options = {}) {
	ensureProgramStyles();
	ensureBrowserStyles();
	const surface = createBrowserSurface();
	surface.editor.value = textContent(options.content) || defaultGuestMarkup();
	let controller = null;
	const render = () => controller?.render(surface.editor.value);
	const selfHost = () => controller?.selfHost(Number(surface.depth.value || 0));
	surface.renderButton.addEventListener("click", render);
	surface.selfHostButton.addEventListener("click", selfHost);
	surface.address.addEventListener("keydown", event => {
		if (event.key === "Enter") {
			render();
		}
	});

	createBrowserController(surface, options).then(value => {
		controller = value;
		controller.render(surface.editor.value);
	}).catch(error => {
		surface.metrics.textContent = browserFailureReport(error);
	});

	return {
		div: surface.root,
		onclose() {
			surface.renderButton.removeEventListener("click", render);
			surface.selfHostButton.removeEventListener("click", selfHost);
		},
		onresize() {
			controller?.resize();
		}
	};
}

function ensureBrowserStyles(documentObject = document) {
	if (documentObject.getElementById(STYLE_ID)) {
		return;
	}
	const link = documentObject.createElement("link");
	link.id = STYLE_ID;
	link.rel = "stylesheet";
	link.href = STYLE_URL;
	documentObject.head.appendChild(link);
}

function textContent(content) {
	if (typeof content === "string") {
		return content;
	}
	return content?.content || "";
}

function browserFailureReport(error) {
	return JSON.stringify({
		code: error?.code || "MERKAVA_BROWSER_FAILED",
		message: error?.message || String(error),
		stack: error?.stack || null
	}, null, 2);
}
