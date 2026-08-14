//B"H
//Boruch Hashem
//Blessed is He

import { EMBED_MODES, nextEmbedDepth } from "../../../shared/embed/depth.js";
import { exactOrigin } from "../../../shared/embed/origin.js";
import { EMBED_PROTOCOL_VERSION } from "../../../shared/embed/protocol.js";

/**
 * @file Drive workspace embed covenant.
 * @description
 * The Awtsmoos creates shell and project world as one moment while the iframe remains a bounded vessel;
 * Awtsmoos.com names exact origin, depth, protocol, and containment before Drive may enter the OS.
 */

export const DRIVE_WORKSPACE_SANDBOX = [
	"allow-forms",
	"allow-modals",
	"allow-popups",
	"allow-popups-to-escape-sandbox",
	"allow-same-origin",
	"allow-scripts"
].join(" ");

export const DRIVE_WORKSPACE_ALLOW = [
	"clipboard-read",
	"clipboard-write"
].join("; ");

/** Builds the exact same-origin Drive workspace URL and containment policy. */
export function createDriveWorkspaceEmbedConfiguration(options = {}) {
	const locationObject = options.locationObject || globalThis.location;
	const origin = exactOrigin(locationObject?.href || locationObject?.origin);
	if (!origin) {
		return { ok: false, error: "embed_origin_unavailable" };
	}
	const depth = nextEmbedDepth(locationObject?.search || "");
	if (!depth.ok) {
		return depth;
	}
	const url = new URL(options.drivePath || "/apps/drive/", origin);
	url.searchParams.set("embed", "awtsmoos-os");
	url.searchParams.set("embedMode", EMBED_MODES.OS_APPLICATION);
	url.searchParams.set("embedParent", "geelooy-os");
	url.searchParams.set("embedParentOrigin", origin);
	url.searchParams.set("embedDepth", String(depth.next));
	url.searchParams.set("embedProtocol", String(EMBED_PROTOCOL_VERSION));
	return {
		ok: true,
		url: url.toString(),
		targetOrigin: url.origin,
		depth: depth.next,
		sandbox: DRIVE_WORKSPACE_SANDBOX,
		allow: DRIVE_WORKSPACE_ALLOW
	};
}
