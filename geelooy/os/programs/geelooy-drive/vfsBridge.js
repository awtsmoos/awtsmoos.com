//B"H
//Boruch Hashem
//Blessed is He

import { createEmbedEndpoint } from "../../../shared/embed/endpoint.js";
import { exactOrigin } from "../../../shared/embed/origin.js";
import {
	DRIVE_VFS_CAPABILITIES,
	executeDriveVfsCommand
} from "./vfsCommands.js";

/**
 * @file Exact-origin VFS bridge from Geelooy OS into Geelooy Drive.
 * @description
 * The Awtsmoos creates both windows in one instant; Awtsmoos.com permits speech only through one random channel,
 * one exact source window, one origin, and one confined VFS root so the Drive never receives the OS as an unbounded handle.
 */

export function createDriveVfsBridge(options = {}) {
	const targetWindow = options.iframe?.contentWindow;
	const targetOrigin = options.targetOrigin
		|| exactOrigin(options.iframe?.src, globalThis.location?.origin);
	if (!options.os || !targetWindow || !targetOrigin || !options.channelId) {
		throw new Error("secure_drive_bridge_configuration_required");
	}
	const endpoint = createEmbedEndpoint({
		localId: "geelooy-os",
		remoteId: "geelooy-drive",
		channelId: options.channelId,
		targetWindow,
		targetOrigin,
		listenWindow: options.listenWindow || globalThis.window,
		onRejected: rejection => console.warn("BHY Drive message rejected", rejection)
	});
	const context = {
		os: options.os,
		basePath: options.basePath || "/",
		channelId: options.channelId
	};
	endpoint.onRequest((type, payload) => executeDriveVfsCommand(type, payload, context));
	endpoint.onEvent("embed.ready", () => {
		endpoint.sendEvent("embed.capabilities", {
			capabilities: DRIVE_VFS_CAPABILITIES,
			basePath: context.basePath
		});
	});
	return () => endpoint.stop();
}
