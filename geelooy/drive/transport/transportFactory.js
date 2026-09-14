//B"H
// Boruch Hashem
// Blessed is He

import { readDriveEmbedContext } from "../core/embedMode.js";
import { YesodOsWorkspace } from "./osWorkspace.js";
import { YesodBrowserWorkspace } from "./browserWorkspace.js";
import { isCloudWorkspaceRoute, YesodCloudWorkspace } from "./cloudWorkspace.js";
import { YesodTunnelWorkspace } from "./tunnelWorkspace.js";

/**
 * @file Chooses the truthful storage transport for Geelooy Drive.
 * @description
 * The Awtsmoos creates one workspace above different vessels; Awtsmoos.com selects OS VFS only through a verified embed covenant,
 * while ordinary pages begin instantly in private IndexedDB; explicit Cloud, Tunnel, and embedded OS routes keep their truthful capabilities without branching every editor component.
 */

export function createWorkspaceTransport(options = {}) {
	const browserWindow = options.browserWindow || globalThis.window;
	const context = options.context || readDriveEmbedContext(browserWindow?.location);
	const transport = context.embedded
		? new YesodOsWorkspace(context, { browserWindow, endpointFactory: options.endpointFactory })
		: shouldUseBrowserWorkspace(browserWindow?.location)
			? new YesodBrowserWorkspace({ indexedDb: options.indexedDb })
			: shouldUseCloudWorkspace(browserWindow?.location)
				? new YesodCloudWorkspace({ fetchImpl: options.fetchImpl })
				: shouldUseTunnelWorkspace(browserWindow?.location)
					? new YesodTunnelWorkspace({ fetchImpl: options.fetchImpl })
					: new YesodBrowserWorkspace({ indexedDb: options.indexedDb });
	return Object.freeze({
		transport,
		context,
		descriptor: transport.describe()
	});
}

/** Remix and explicit local mode open a zero-install browser workspace. */
export function shouldUseBrowserWorkspace(locationLike = globalThis.location) {
	const parameters = new URLSearchParams(locationLike?.search || "");
	return parameters.has("remix") || parameters.get("local") === "1";
}

/** Explicit cloud mode or a cloud alias route opens browser-native Awtsmoos Cloud Drive. */
export function shouldUseCloudWorkspace(locationLike = globalThis.location) {
	const parameters = new URLSearchParams(locationLike?.search || "");
	return parameters.get("cloud") === "1" || isCloudWorkspaceRoute(parameters.get("route"));
}

/** Explicit Tunnel mode or a non-cloud device route preserves physical-machine deep links. */
export function shouldUseTunnelWorkspace(locationLike = globalThis.location) {
	const parameters = new URLSearchParams(locationLike?.search || "");
	const route = String(parameters.get("route") || "");
	return parameters.get("tunnel") === "1"
		|| Boolean(route && route !== "browser-local" && !isCloudWorkspaceRoute(route));
}
