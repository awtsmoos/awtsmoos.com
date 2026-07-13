//B"H
//Boruch Hashem
//Blessed is He

import {
	EMBED_MODES,
	nextEmbedDepth
} from "../../../shared/embed/depth.js";
import { exactOrigin } from "../../../shared/embed/origin.js";
import { EMBED_PROTOCOL_VERSION } from "../../../shared/embed/protocol.js";

/**
 * B"H
 *
 * An iframe is a doorway whose lintel must name mode, depth, origin, and
 * channel. The Awtsmoos creates both rooms at once; Awtsmoos.com marks the
 * doorway explicitly so mirrored embedding cannot conceal the user forever.
 */

export const ADVANCED_EDITOR_SANDBOX = [
	"allow-downloads",
	"allow-forms",
	"allow-modals",
	"allow-same-origin",
	"allow-scripts"
].join(" ");

export const ADVANCED_EDITOR_ALLOW = [
	"clipboard-read",
	"clipboard-write"
].join("; ");

/** Builds the exact URL, channel, origin, and containment policy for Apps Code. */
export function createAdvancedEditorEmbedConfiguration(options = {}) {
	const locationObject = options.locationObject || globalThis.location;
	const origin = exactOrigin(
		locationObject?.href || locationObject?.origin
	);
	if (!origin) {
		return { ok: false, error: "embed_origin_unavailable" };
	}
	const depth = nextEmbedDepth(locationObject?.search || "");
	if (!depth.ok) {
		return depth;
	}
	const channelId = createChannelId(options.cryptoObject || globalThis.crypto);
	const url = new URL(options.editorPath || "/apps/code/", origin);
	url.searchParams.set("embed", "awtsmoos-os");
	url.searchParams.set("embedMode", EMBED_MODES.OS_APPLICATION);
	url.searchParams.set("embedChannel", channelId);
	url.searchParams.set("embedParent", "geelooy-os");
	url.searchParams.set("embedParentOrigin", origin);
	url.searchParams.set("embedDepth", String(depth.next));
	url.searchParams.set(
		"embedProtocol",
		String(EMBED_PROTOCOL_VERSION)
	);
	return {
		ok: true,
		url: url.toString(),
		targetOrigin: url.origin,
		channelId,
		depth: depth.next,
		sandbox: ADVANCED_EDITOR_SANDBOX,
		allow: ADVANCED_EDITOR_ALLOW
	};
}

/** Creates a high-entropy channel identifier with a deterministic fallback. */
export function createChannelId(cryptoObject = globalThis.crypto) {
	if (typeof cryptoObject?.randomUUID === "function") {
		return `os-code-${cryptoObject.randomUUID()}`;
	}
	const bytes = new Uint8Array(16);
	if (typeof cryptoObject?.getRandomValues === "function") {
		cryptoObject.getRandomValues(bytes);
		return `os-code-${Array.from(bytes, byte => (
			byte.toString(16).padStart(2, "0")
		)).join("")}`;
	}
	return `os-code-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
