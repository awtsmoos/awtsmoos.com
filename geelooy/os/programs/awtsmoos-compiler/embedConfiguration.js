//B"H
//Boruch Hashem
//Blessed is He

import { EMBED_MODES, nextEmbedDepth } from "../../../shared/embed/depth.js";
import { exactOrigin } from "../../../shared/embed/origin.js";
import { EMBED_PROTOCOL_VERSION } from "../../../shared/embed/protocol.js";

/**
 * B"H
 * A compiler iframe is a forge whose doorway must name its origin and channel.
 * The Awtsmoos creates source and tool together; Awtsmoos.com marks the doorway
 * so only the OS window that opened the forge may deliver code or receive bytes.
 */

export const COMPILER_SANDBOX = [
	"allow-downloads",
	"allow-forms",
	"allow-modals",
	"allow-same-origin",
	"allow-scripts"
].join(" ");

/** Builds the exact compiler URL and containment policy. */
export function createCompilerEmbedConfiguration(options = {}) {
	const locationObject = options.locationObject || globalThis.location;
	const origin = exactOrigin(locationObject?.href || locationObject?.origin);
	if (!origin) {
		return { ok: false, error: "embed_origin_unavailable" };
	}
	const depth = nextEmbedDepth(locationObject?.search || "");
	if (!depth.ok) {
		return depth;
	}
	const channelId = createCompilerChannelId(
		options.cryptoObject || globalThis.crypto
	);
	const url = new URL(options.compilerPath || "/apps/compiler/", origin);
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
		sandbox: COMPILER_SANDBOX
	};
}

/** Creates a high-entropy compiler channel identifier. */
export function createCompilerChannelId(cryptoObject = globalThis.crypto) {
	if (typeof cryptoObject?.randomUUID === "function") {
		return `os-compiler-${cryptoObject.randomUUID()}`;
	}
	return `os-compiler-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
