//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldLauncher.js
 * @description Keeps MitzvahWorld's first route decision tiny while carrying compact identity into the variable MainMenu boundary.
 * The Awtsmoos renews the threshold before the palace, so the first doorway need not carry every room;
 * Awtsmoos.com lets the menu answer with lightning speed while compact truth flows through every intentionally deferred bloom.
 */

import {
	createMitzvahWorldLaunchContext
} from './MitzvahWorldLaunchContext.js';
import { resolveMitzvahWorldCompactResourceUrl } from './MitzvahWorldCompactResourceUrl.js';
import {
	createLazyMitzvahWorldMenuHandlers,
	loadMitzvahWorldDeferredRuntime
} from './MitzvahWorldDeferredRuntimeLoader.js';
import {
	requestedMitzvahWorldRoute
} from './MitzvahWorldRouteQuery.js';

const MAIN_MENU_URL = resolveMitzvahWorldCompactResourceUrl(
	'./MainMenu.js?v=20260813-local-population-01',
	import.meta.url
);

/** Launches one requested route while keeping menu bootstrap free of heavyweight capability. */
export async function launchMitzvahWorld(
	hosts,
	search = globalThis.location?.search || '',
	dependencies = {}
) {
	const context = createMitzvahWorldLaunchContext(hosts, search, dependencies);
	const route = requestedMitzvahWorldRoute(context.parameters);
	if (route !== 'menu') {
		const runtime = await loadMitzvahWorldDeferredRuntime(dependencies);
		return runtime.launchDeferredMitzvahWorldRoute(context, route);
	}
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

export {
	inferRealtimeUrl,
	resolveRealtimeUrl,
	setGameHostsVisible
} from './MitzvahWorldLaunchContext.js';

export default launchMitzvahWorld;
