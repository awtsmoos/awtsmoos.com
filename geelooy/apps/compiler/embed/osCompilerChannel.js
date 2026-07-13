//B"H
//Boruch Hashem
//Blessed is He

import { EMBED_MODES } from "../../../shared/embed/depth.js";
import { createEmbedEndpoint } from "../../../shared/embed/endpoint.js";
import { sameOriginParentOrigin } from "../../../shared/embed/origin.js";
import { EMBED_PROTOCOL_VERSION } from "../../../shared/embed/protocol.js";

/**
 * B"H
 * The forge answers only the desktop that opened it. The Awtsmoos creates parent
 * and child in one instant; Awtsmoos.com rejects wildcard messages and returns
 * compiled bytes only through the exact source, origin, and channel covenant.
 */

let activeChannel = null;

/** Reads and validates explicit Geelooy OS compiler embed parameters. */
export function readCompilerEmbedConfiguration(
	locationObject = globalThis.location,
	documentObject = globalThis.document
) {
	const parameters = new URLSearchParams(locationObject?.search || "");
	const protocolVersion = Number(parameters.get("embedProtocol") || 0);
	const configuration = {
		enabled: parameters.get("embed") === "awtsmoos-os"
			&& parameters.get("embedMode") === EMBED_MODES.OS_APPLICATION,
		channelId: parameters.get("embedChannel") || "",
		parentOrigin: sameOriginParentOrigin(locationObject, documentObject),
		protocolVersion
	};
	configuration.valid = configuration.enabled
		&& Boolean(configuration.channelId)
		&& Boolean(configuration.parentOrigin)
		&& protocolVersion === EMBED_PROTOCOL_VERSION;
	return configuration;
}

/** Starts the secure compiler endpoint and exposes source/artifact helpers. */
export function initializeCompilerChannel(options = {}) {
	if (activeChannel) {
		return activeChannel;
	}
	const windowObject = options.windowObject || globalThis.window;
	const configuration = options.configuration
		|| readCompilerEmbedConfiguration(
			options.locationObject,
			options.documentObject
		);
	if (!configuration.valid || !windowObject?.parent) {
		return null;
	}
	const endpoint = createEmbedEndpoint({
		localId: "apps-compiler",
		remoteId: "geelooy-os",
		channelId: configuration.channelId,
		targetWindow: windowObject.parent,
		targetOrigin: configuration.parentOrigin,
		listenWindow: windowObject,
		onRejected: options.onRejected
	});
	activeChannel = channelFacade(endpoint);
	endpoint.sendEvent("embed.ready", {
		product: "apps-compiler",
		capabilities: ["compiler.source.open", "compiler.artifact.ready"]
	});
	return activeChannel;
}

function channelFacade(endpoint) {
	return {
		onSource(listener) {
			return endpoint.onEvent("compiler.source.open", listener);
		},
		async publishArtifact(artifact = {}) {
			const bytes = await artifact.blob.arrayBuffer();
			endpoint.sendEvent("compiler.artifact.ready", {
				...artifact,
				blob: undefined,
				bytes
			});
		},
		close() {
			endpoint.stop();
			activeChannel = null;
		}
	};
}
