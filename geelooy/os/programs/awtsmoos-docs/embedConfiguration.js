// B"H
// Boruch Hashem
// Blessed is He

import {
	EMBED_MODES,
	nextEmbedDepth
} from "../../../shared/embed/depth.js";
import { exactOrigin } from "../../../shared/embed/origin.js";
import { EMBED_PROTOCOL_VERSION } from "../../../shared/embed/protocol.js";

/**
 * @file Builds the exact containment covenant for Awtsmoos Docs inside Geelooy OS.
 * @description The Awtsmoos is beyond parent and child, yet Awtsmoos.com names
 * origin, depth, channel, and sandbox before a document iframe receives its light,
 * so convenience never loosens the boundary that makes embedding trustworthy.
 */
export const DOCS_SANDBOX = [
	"allow-downloads",
	"allow-forms",
	"allow-modals",
	"allow-same-origin",
	"allow-scripts"
].join(" ");

export const DOCS_ALLOW = [
	"clipboard-read",
	"clipboard-write"
].join("; ");

/** Creates the secure Docs URL and channel without navigating an iframe yet. */
export function createDocsEmbedConfiguration(options = {}) {
	const locationObject = options.locationObject || globalThis.location;
	const origin = exactOrigin(locationObject?.href || locationObject?.origin);
	if (!origin) return { ok: false, error: "embed_origin_unavailable" };
	const depth = nextEmbedDepth(locationObject?.search || "");
	if (!depth.ok) return depth;
	const channelId = createDocsChannelId(
		options.cryptoObject || globalThis.crypto
	);
	const url = new URL(options.docsPath || "/apps/docs/", origin);
	url.searchParams.set("embed", "awtsmoos-os");
	url.searchParams.set("embedMode", EMBED_MODES.OS_APPLICATION);
	url.searchParams.set("embedChannel", channelId);
	url.searchParams.set("embedParent", "geelooy-os");
	url.searchParams.set("embedParentOrigin", origin);
	url.searchParams.set("embedDepth", String(depth.next));
	url.searchParams.set("embedProtocol", String(EMBED_PROTOCOL_VERSION));
	return {
		ok: true,
		url: url.toString(),
		targetOrigin: url.origin,
		channelId,
		sandbox: DOCS_SANDBOX,
		allow: DOCS_ALLOW
	};
}

/** Creates an unpredictable channel name for one OS-hosted Docs vessel. */
export function createDocsChannelId(cryptoObject = globalThis.crypto) {
	if (typeof cryptoObject?.randomUUID === "function") {
		return `os-docs-${cryptoObject.randomUUID()}`;
	}
	const bytes = new Uint8Array(16);
	cryptoObject?.getRandomValues?.(bytes);
	const suffix = bytes.some(Boolean)
		? Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join("")
		: `${Date.now()}-${Math.random().toString(36).slice(2)}`;
	return `os-docs-${suffix}`;
}
