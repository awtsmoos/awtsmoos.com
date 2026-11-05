//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahWorldLauncher.js
 * @description Keeps route choice tiny while the page loading authority remains connected to successful selected-world completion.
 * The Awtsmoos renews menu and meadow in one present light; Awtsmoos.com lets the chooser reopen the veil for intentional entry,
 * then carries the page-owned completion callback through the menu so successful world publication closes that same finite threshold.
 */

import { createMitzvahWorldLaunchContext } from './MitzvahWorldLaunchContext.js';
import {
	createLazyMitzvahWorldMenuHandlers,
	loadMitzvahWorldDeferredRuntime
} from './MitzvahWorldDeferredRuntimeLoader.js';
import { resolveMitzvahWorldReleaseResourceUrl } from './MitzvahWorldReleaseResourceUrl.js';
import { requestedMitzvahWorldRoute } from './MitzvahWorldRouteQuery.js';

const MAIN_MENU_URL = resolveMitzvahWorldReleaseResourceUrl('./MainMenu.js', import.meta.url);

/** Launches one requested route while keeping menu bootstrap free of heavyweight capability. */
export async function launchMitzvahWorld(
	hosts,
	search = globalThis.location?.search || '',
	dependencies = {}
) {
	const context = createMitzvahWorldLaunchContext(hosts, search, dependencies);
	const route = requestedMitzvahWorldRoute(context.parameters);
	if (route !== 'menu') {
		reportLauncherProgress(dependencies, 'Opening the selected world route…', 'deferred-runtime');
		const runtime = await loadMitzvahWorldDeferredRuntime(dependencies);
		return runtime.launchDeferredMitzvahWorldRoute(context, route);
	}
	reportLauncherProgress(dependencies, 'Opening the world chooser…', 'menu-module', MAIN_MENU_URL);
	const menuModule = dependencies.showMainMenu
		? null
		: await import(MAIN_MENU_URL);
	const renderMenu = dependencies.showMainMenu || menuModule.showMainMenu;
	return renderMenu(hosts, createLazyMitzvahWorldMenuHandlers(context), {
		WebSocketClass: context.environment.WebSocket,
		environment: context.environment,
		onWorldLaunchComplete: dependencies.onWorldLaunchComplete,
		realtimeUrl: context.realtimeUrl
	});
}

/** Reports a low-cost essential launcher milestone through the existing loading contract. */
function reportLauncherProgress(dependencies, message, stage, url = '') {
	dependencies.onProgress?.({
		message,
		progress: 0.02,
		stage,
		url
	});
}

export {
	inferRealtimeUrl,
	resolveRealtimeUrl,
	setGameHostsVisible
} from './MitzvahWorldLaunchContext.js';

export default launchMitzvahWorld;
