//B"H
//Boruch Hashem
//Blessed is He

import { createEmbedEndpoint } from "../../../shared/embed/endpoint.js";
import { exactOrigin } from "../../../shared/embed/origin.js";
import { bindCompilerBridge } from "./compilerBridge.js";
import {
	EDITOR_VFS_CAPABILITIES,
	executeEditorVfsCommand
} from "./vfsCommands.js";

/**
 * B"H
 * The VFS bridge is a guarded artery between Apps Code and Geelooy OS. The
 * Awtsmoos creates file, compiler, iframe, and desktop together; Awtsmoos.com
 * binds their speech to one exact window, origin, channel, and workspace root.
 */

const bridges = new WeakMap();
const LEGACY_TYPES = Object.freeze({
	"awtsmoos-os:list": "vfs.list",
	"awtsmoos-os:read": "vfs.read",
	"awtsmoos-os:write": "vfs.write",
	"awtsmoos-os:mkdir": "vfs.create",
	"awtsmoos-os:remove": "vfs.remove",
	"awtsmoos-os:move": "vfs.move"
});

/** Creates one secure Geelooy OS endpoint for one Apps Code iframe. */
export function createVfsBridge(options = {}) {
	const configuration = bridgeConfiguration(options);
	const endpoint = createEmbedEndpoint({
		localId: "geelooy-os",
		remoteId: "apps-code",
		channelId: configuration.channelId,
		targetWindow: configuration.targetWindow,
		targetOrigin: configuration.targetOrigin,
		listenWindow: options.listenWindow || globalThis.window,
		onRejected: options.onRejected || reportRejectedMessage
	});
	const context = {
		os: options.os,
		basePath: options.basePath || "/",
		channelId: configuration.channelId
	};
	endpoint.onRequest((type, payload) => (
		executeEditorVfsCommand(type, payload, context)
	));
	bindCompilerBridge(endpoint, options.os, context.basePath);
	endpoint.onEvent("embed.ready", () => {
		endpoint.sendEvent("embed.capabilities", {
			capabilities: EDITOR_VFS_CAPABILITIES
		});
		postOpenFile(options.iframe, context.basePath, options.initialFile);
	});
	const bridge = createBridge(endpoint, options.iframe, context.basePath);
	bridges.set(options.iframe, bridge);
	return bridge.dispose;
}

/** Preserves the testable command boundary while using the secure allowlist. */
export async function runCommand(message = {}, context = {}) {
	const type = LEGACY_TYPES[message.type] || message.type;
	return await executeEditorVfsCommand(
		type,
		message.payload || {},
		context
	);
}

/** Sends the selected initial file through the iframe's bound endpoint. */
export function postOpenFile(iframe, basePath, payload = {}) {
	const bridge = bridges.get(iframe);
	if (!bridge) {
		throw new Error("secure_editor_bridge_unavailable");
	}
	bridge.openFile({ basePath, ...payload });
}

function createBridge(endpoint, iframe, basePath) {
	return {
		openFile(payload = {}) {
			endpoint.sendEvent("file.open", { basePath, ...payload });
		},
		dispose() {
			endpoint.stop();
			bridges.delete(iframe);
		}
	};
}

function bridgeConfiguration(options) {
	const targetWindow = options.iframe?.contentWindow;
	const targetOrigin = options.targetOrigin
		|| exactOrigin(options.iframe?.src, globalThis.location?.origin);
	const channelId = options.channelId
		|| new URL(options.iframe?.src, targetOrigin).searchParams.get(
			"embedChannel"
		);
	if (!options.os || !targetWindow || !targetOrigin || !channelId) {
		throw new Error("secure_editor_bridge_configuration_required");
	}
	return { targetWindow, targetOrigin, channelId };
}

function reportRejectedMessage(rejection) {
	console.warn("BHY secure editor message rejected", rejection);
}
