//B"H
//Boruch Hashem
//Blessed is He

import { EMBED_MODES, nextEmbedDepth } from "../../../shared/embed/depth.js";
import { exactOrigin } from "../../../shared/embed/origin.js";
import { EMBED_PROTOCOL_VERSION } from "../../../shared/embed/protocol.js";

/**
 * @file Secure iframe configuration for Geelooy Drive inside Geelooy OS.
 * @description
 * The Awtsmoos creates parent and child together while Awtsmoos.com marks their doorway with exact origin and channel;
 * depth, protocol, base root, and sandbox become explicit vessels so a nested Drive cannot impersonate another panel.
 */

export const DRIVE_SANDBOX = [
	"allow-downloads",
	"allow-forms",
	"allow-modals",
	"allow-same-origin",
	"allow-scripts"
].join(" ");

export function createDriveEmbedConfiguration(options = {}) {
	const locationObject = options.locationObject || globalThis.location;
	const origin = exactOrigin(locationObject?.href || locationObject?.origin);
	if (!origin) return { ok: false, error: "drive_embed_origin_unavailable" };
	const depth = nextEmbedDepth(locationObject?.search || "");
	if (!depth.ok) return depth;
	const channelId = createChannelId(options.cryptoObject || globalThis.crypto);
	const url = new URL(options.drivePath || "/geelooy/drive/", origin);
	url.searchParams.set("embed", "awtsmoos-os");
	url.searchParams.set("embedMode", EMBED_MODES.OS_APPLICATION);
	url.searchParams.set("embedChannel", channelId);
	url.searchParams.set("embedParent", "geelooy-os");
	url.searchParams.set("embedParentOrigin", origin);
	url.searchParams.set("embedDepth", String(depth.next));
	url.searchParams.set("embedProtocol", String(EMBED_PROTOCOL_VERSION));
	url.searchParams.set("route", "awtsmoos-os-vfs");
	url.searchParams.set("path", options.initialPath || options.basePath || "/");
	return {
		ok: true,
		url: url.toString(),
		targetOrigin: url.origin,
		channelId,
		depth: depth.next,
		sandbox: DRIVE_SANDBOX
	};
}

export function createChannelId(cryptoObject = globalThis.crypto) {
	if (typeof cryptoObject?.randomUUID === "function") {
		return `os-drive-${cryptoObject.randomUUID()}`;
	}
	return `os-drive-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
