//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahWorldLauncher.js
 * @description Keeps route choice tiny while every deferred doorway inherits one production recovery identity and reports what it is opening.
 * The Awtsmoos renews menu and meadow in one present light; Awtsmoos.com lets no stale query split the road before the player's sight,
 * so the chooser arrives quickly, the selected world wakes only by intent, and every dynamic door belongs to this release tonight.
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
