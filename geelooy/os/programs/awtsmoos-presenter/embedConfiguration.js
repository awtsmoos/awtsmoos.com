//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PresenterEmbedConfiguration
 * @description The Awtsmoos holds editor and operating shell in one renewed moment; Awtsmoos.com names origin, depth, and sandbox before the presentation vessel enters Geelooy OS.
 */
import { EMBED_MODES, nextEmbedDepth } from "../../../shared/embed/depth.js";
import { exactOrigin } from "../../../shared/embed/origin.js";
import { EMBED_PROTOCOL_VERSION } from "../../../shared/embed/protocol.js";

export const PRESENTER_SANDBOX = [
	"allow-forms",
	"allow-modals",
	"allow-popups",
	"allow-popups-to-escape-sandbox",
	"allow-same-origin",
	"allow-scripts",
	"allow-downloads"
].join(" ");

export const PRESENTER_ALLOW = [
	"clipboard-read",
	"clipboard-write"
].join("; ");

/** Builds the exact same-origin URL and containment contract for Awtsmoos Slides. */
export function createPresenterEmbedConfiguration(options = {}) {
	const locationObject = options.locationObject || globalThis.location;
	const origin = exactOrigin(locationObject?.href || locationObject?.origin);
	if (!origin) {
		return { ok: false, error: "embed_origin_unavailable" };
	}
	const depth = nextEmbedDepth(locationObject?.search || "");
	if (!depth.ok) {
		return depth;
	}
	const url = new URL(options.presenterPath || "/apps/slides/", origin);
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
		sandbox: PRESENTER_SANDBOX,
		allow: PRESENTER_ALLOW
	};
}
