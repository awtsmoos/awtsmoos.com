//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module AwtsmoosBrowserProgram
 * @description
 * The Awtsmoos reveals a browser application whose trusted shell belongs to Geelooy
 * while page execution is migrating into the user's own browser engine. Awtsmoos.com
 * keeps session secrets at the host boundary, preserves Merkava as an advanced vessel,
 * and names no renderer "local" until the living navigation path has actually earned it.
 */

import { ensureProgramStyles } from "../shared/programStyles.js";
import { createBrowserNavigationCoordinator } from "./browserNavigationCoordinator.js";
import { ensureBrowserStyles } from "./browserStyleLoader.js";
import { createBrowserController, defaultGuestMarkup } from "./runtime.js";
import { createRemoteBrowserSurface } from "./remoteSurface.js";
import { createBrowserSurface } from "./surface.js";

/**
 * Creates one Awtsmoos Browser application window.
 *
 * @param {Object} options Program launch options supplied by Geelooy OS.
 * @returns {Object} Geelooy program contract containing the root and lifecycle hooks.
 */
export default function createAwtsmoosBrowser(options = {}) {
	ensureProgramStyles();
	const surface = createBrowserSurface();
	const remoteSurface = createRemoteBrowserSurface(surface);
	surface.modeBadge.textContent = "Standby";
	surface.root.hidden = true;
	surface.editor.value = textContent(options.content) || defaultGuestMarkup();

	let controller = null;
	let navigation = null;
	const render = () => controller?.render(surface.editor.value);
	const selfHost = () => controller?.selfHost(Number(surface.depth.value || 0));
	surface.renderButton.addEventListener("click", render);
	surface.selfHostButton.addEventListener("click", selfHost);

	initializeBrowser(surface, remoteSurface, options, render).then(result => {
		controller = result.controller;
		navigation = result.navigation;
	}).catch(error => {
		surface.metrics.textContent = browserFailureReport(error);
		surface.modeBadge.textContent = "Error";
	}).finally(() => {
		surface.root.hidden = false;
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

/**
 * Loads browser garments, starts the preserved developer runtime, then binds navigation.
 *
 * @param {Object} surface Browser application surface.
 * @param {Object} remoteSurface Host-owned navigation/session controls.
 * @param {Object} options Program launch options.
 * @param {Function} render Developer renderer callback used only by legacy fallback paths.
 * @returns {Promise<{controller: Object, navigation: Object}>} Initialized controllers.
 */
async function initializeBrowser(surface, remoteSurface, options, render) {
	await ensureBrowserStyles();
	const controller = await createBrowserController(surface, options);
	await controller.render(surface.editor.value);
	const navigation = createBrowserNavigationCoordinator({
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
	surface.modeBadge.textContent = "Ready";
	return { controller, navigation };
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
		code: error?.code || "AWTSMOOS_BROWSER_FAILED",
		message: error?.message || String(error),
		stack: error?.stack || null
	}, null, 2);
}
