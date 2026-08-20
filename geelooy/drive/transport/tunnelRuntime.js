//B"H
// Boruch Hashem
// Blessed is He

import { credentialedCommandAction } from "./credentialedFs.js";
import { assertTunnelSuccess } from "./resultShapes.js";

/**
 * @file Managed static-runtime transport for Tunnel-backed Geelooy Drive projects.
 * @description
 * The Awtsmoos lets a folder become a listening doorway while Awtsmoos.com exposes only bounded server actions;
 * no shell text or executable command enters this vessel—only start, list, logs, public proxy, and stop transactions.
 */

export class NetzachTunnelRuntime {
	constructor(options = {}) {
		this.fetchImpl = options.fetchImpl || globalThis.fetch;
		this.keyProvider = options.keyProvider || (() => "");
	}

	start(routeReference, path, options = {}) {
		return this.command(routeReference, {
			action: "staticServerStart",
			path,
			port: 0,
			index: options.index || "index.html",
			spaFallback: options.spaFallback !== false,
			cors: options.cors === true
		}, "Could not start the managed static server.");
	}

	list(routeReference) {
		return this.command(
			routeReference,
			{ action: "staticServerList" },
			"Could not list managed static servers."
		);
	}

	logs(routeReference, serverId, maxLogs = 80) {
		return this.command(routeReference, {
			action: "staticServerLogs",
			serverId,
			maxLogs
		}, "Could not read managed server logs.");
	}

	stop(routeReference, serverId) {
		return this.command(routeReference, {
			action: "staticServerStop",
			serverId
		}, "Could not stop the managed static server.");
	}

	expose(routeReference, server, options = {}) {
		return this.command(routeReference, {
			action: "previewExposeLocalServer",
			tunnelName: routeReference,
			port: server.port,
			proxyPath: "/",
			title: options.title || "Geelooy Drive runtime",
			visibility: options.visibility || "private",
			verifyPublic: options.verifyPublic !== false
		}, "Could not expose this managed server publicly.");
	}

	async command(routeReference, payload, fallbackMessage) {
		const result = await credentialedCommandAction(
			routeReference,
			payload,
			this.keyProvider(),
			this.fetchImpl
		);
		return assertTunnelSuccess(result, fallbackMessage);
	}
}
