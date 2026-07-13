//B"H
//Boruch Hashem
//Blessed is He

import { readEmbedDepth, EMBED_MODES } from "../../../../shared/embed/depth.js";
import { createEmbedEndpoint } from "../../../../shared/embed/endpoint.js";
import { sameOriginParentOrigin } from "../../../../shared/embed/origin.js";
import { EMBED_PROTOCOL_VERSION } from "../../../../shared/embed/protocol.js";

/**
 * B"H
 * Apps Code speaks to Geelooy OS through one named same-origin channel. The
 * Awtsmoos creates editor, compiler, and desktop together; Awtsmoos.com refuses
 * wildcard speech so foreign parents cannot borrow files or execution requests.
 */

const LEGACY_VFS_TYPES = Object.freeze({
	requestFolderList: "vfs.list",
	requestFileContent: "vfs.read",
	requestFileWrite: "vfs.write",
	requestItemCreate: "vfs.create",
	requestItemDelete: "vfs.remove"
});

const OS_CAPABILITIES = Object.freeze([
	"file.open",
	"compiler.open",
	"vfs.list",
	"vfs.read",
	"vfs.write",
	"vfs.create",
	"vfs.remove",
	"vfs.move"
]);

let activeChannel = null;

/** Reads and validates the explicit OS-application embed configuration. */
export function readOsEmbedConfiguration(
	locationObject = globalThis.location,
	documentObject = globalThis.document
) {
	const parameters = new URLSearchParams(locationObject?.search || "");
	const configuration = {
		enabled: parameters.get("embed") === "awtsmoos-os"
			&& parameters.get("embedMode") === EMBED_MODES.OS_APPLICATION,
		channelId: parameters.get("embedChannel") || "",
		parentOrigin: sameOriginParentOrigin(locationObject, documentObject),
		depth: readEmbedDepth(locationObject?.search),
		protocolVersion: Number(parameters.get("embedProtocol") || 0)
	};
	configuration.valid = configuration.enabled
		&& Boolean(configuration.channelId)
		&& Boolean(configuration.parentOrigin)
		&& configuration.protocolVersion === EMBED_PROTOCOL_VERSION;
	return configuration;
}

/** Starts the singleton secure OS endpoint when configuration is valid. */
export function initializeOsChannel(options = {}) {
	if (activeChannel) {
		return activeChannel;
	}
	const windowObject = options.windowObject || globalThis.window;
	const configuration = options.configuration
		|| readOsEmbedConfiguration(
			options.locationObject,
			options.documentObject
		);
	if (!configuration.valid || !windowObject?.parent) {
		return null;
	}
	activeChannel = createEmbedEndpoint({
		localId: "apps-code",
		remoteId: "geelooy-os",
		channelId: configuration.channelId,
		targetWindow: windowObject.parent,
		targetOrigin: configuration.parentOrigin,
		listenWindow: windowObject,
		timeoutMilliseconds: options.timeoutMilliseconds,
		setTimer: options.setTimer,
		clearTimer: options.clearTimer,
		idFactory: options.idFactory,
		onRejected: options.onRejected
	});
	activeChannel.sendEvent("embed.ready", {
		product: "apps-code",
		mode: EMBED_MODES.OS_APPLICATION,
		depth: configuration.depth,
		capabilities: OS_CAPABILITIES
	});
	return activeChannel;
}

/** Returns the active channel without creating a permissive fallback. */
export function getOsChannel() {
	return activeChannel || initializeOsChannel();
}

/** Sends one typed VFS request through the secure OS channel. */
export function requestOsVfs(type, payload = {}) {
	const channel = getOsChannel();
	if (!channel) {
		return Promise.reject(new Error("secure_os_embed_channel_unavailable"));
	}
	return channel.request(LEGACY_VFS_TYPES[type] || type, payload);
}

/** Stops the endpoint and clears singleton state for teardown and tests. */
export function closeOsChannel() {
	activeChannel?.stop();
	activeChannel = null;
}
