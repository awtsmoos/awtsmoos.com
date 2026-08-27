//B"H
// Boruch Hashem
// Blessed is He

import { readDriveEmbedContext } from "../core/embedMode.js";
import { YesodOsWorkspace } from "./osWorkspace.js";
import { YesodTunnelWorkspace } from "./tunnelWorkspace.js";

/**
 * @file Chooses the truthful storage transport for Geelooy Drive.
 * @description
 * The Awtsmoos creates one workspace above different vessels; Awtsmoos.com selects OS VFS only through a verified embed covenant,
 * while ordinary pages remain on the authenticated Tunnel route without branching every editor and browser component.
 */

export function createWorkspaceTransport(options = {}) {
	const browserWindow = options.browserWindow || globalThis.window;
	const context = options.context || readDriveEmbedContext(browserWindow?.location);
	const transport = context.embedded
		? new YesodOsWorkspace(context, { browserWindow, endpointFactory: options.endpointFactory })
		: new YesodTunnelWorkspace({ fetchImpl: options.fetchImpl });
	return Object.freeze({
		transport,
		context,
		descriptor: transport.describe()
	});
}
