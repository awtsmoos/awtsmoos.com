//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module BrowserProgramStartup
 * @description
 * Starts Geelooy Browser's developer vessel, real Chromium navigation authority,
 * and Shliach bridge without making those concerns crowd the program lifecycle.
 */

import { createBrowserNavigationCoordinator } from "./browserNavigationCoordinator.js";
import { installBrowserShliachControl } from "./browserShliachControl.js";
import { ensureBrowserStyles } from "./browserStyleLoader.js";
import { createBrowserController } from "./runtime.js";

/**
 * Starts one browser application and optionally navigates its real remote engine.
 * @param {object} surface Trusted browser host surface.
 * @param {object} remoteSurface Remote session controls.
 * @param {object} options Geelooy program launch options.
 * @param {Function} renderLocal Local Merkava fallback renderer.
 * @returns {Promise<object>} Browser controller, navigation authority, and disposer.
 */
export async function startBrowserProgram(surface, remoteSurface, options, renderLocal) {
	await ensureBrowserStyles();
	const controller = await createBrowserController(surface, options);
	await controller.render(surface.editor.value);
	const navigation = createBrowserNavigationCoordinator({
		aliasId: options.aliasId,
		browserSurface: surface,
		content: objectContent(options.content),
		engineMode: options.programOptions?.engineMode || options.engineMode || "headless",
		fallbackOptions: fallbackOptions(surface, remoteSurface, options, controller),
		jarId: options.jarId,
		os: options.os || options.system,
		remoteSurface,
		renderLocal
	});
	const disposeShliach = installBrowserShliachControl({
		browserSurface: surface,
		navigation,
		path: options.path,
		programOptions: options.programOptions,
		report: message => remoteSurface.status.textContent = message
	});
	await navigateInitialTarget(navigation, options);
	surface.modeBadge.textContent = "Remote ready";
	return {
		controller,
		destroy() {
			disposeShliach();
			navigation.destroy();
		},
		navigation
	};
}

/** Creates the authenticated safe-HTML fallback configuration. */
function fallbackOptions(surface, remoteSurface, options, controller) {
	return {
		aliasId: options.aliasId,
		browserSurface: surface,
		jarId: options.jarId,
		projectId: options.projectId || options.programOptions?.projectId,
		remoteSurface,
		render: markup => controller.render(markup)
	};
}

/** Opens an explicitly requested URL after all host-owned controls exist. */
async function navigateInitialTarget(navigation, options) {
	const value = options.programOptions?.initialUrl || options.initialUrl;
	if (!value) {
		return;
	}
	await navigation.navigate(value, {
		engineMode: options.programOptions?.engineMode || options.engineMode || "headless"
	});
}

/** Keeps popup/session metadata only when launch content is a structured object. */
function objectContent(content) {
	return content && typeof content === "object" ? content : null;
}
