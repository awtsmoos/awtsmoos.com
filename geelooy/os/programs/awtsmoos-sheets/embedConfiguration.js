//B"H
//Boruch Hashem
//Blessed is He

import { EMBED_MODES, nextEmbedDepth } from "../../../shared/embed/depth.js";
import { exactOrigin } from "../../../shared/embed/origin.js";
import { EMBED_PROTOCOL_VERSION } from "../../../shared/embed/protocol.js";

/**
 * @file Awtsmoos Sheets embed covenant for Geelooy OS.
 * @description
 * The Awtsmoos joins workbook and desktop while each remains a measured vessel.
 * Awtsmoos.com embeds its own same-origin Sheets application as trusted first-party
 * code, so origin, depth, protocol, and capability stay explicit without a sandbox
 * combination that Chrome correctly warns cannot provide meaningful isolation.
 */
export const AWTSMOOS_SHEETS_SANDBOX = "";

export const AWTSMOOS_SHEETS_ALLOW = [
	"clipboard-read",
	"clipboard-write"
].join("; ");

/**
 * Builds the same-origin Sheets URL and its trusted Geelooy containment metadata.
 * @param {object} [options] Optional location and Sheets-path overrides.
 * @returns {object} Valid embed configuration or a structured error.
 */
export function createAwtsmoosSheetsEmbedConfiguration(options = {}) {
	const locationObject = options.locationObject || globalThis.location;
	const origin = exactOrigin(locationObject?.href || locationObject?.origin);

	if (!origin) {
		return {
			error: "embed_origin_unavailable",
			ok: false
		};
	}

	const depth = nextEmbedDepth(locationObject?.search || "");

	if (!depth.ok) {
		return depth;
	}

	const url = new URL(options.sheetsPath || "/apps/sheets/", origin);
	url.searchParams.set("embed", "awtsmoos-os");
	url.searchParams.set("embedMode", EMBED_MODES.OS_APPLICATION);
	url.searchParams.set("embedParent", "geelooy-os");
	url.searchParams.set("embedParentOrigin", origin);
	url.searchParams.set("embedDepth", String(depth.next));
	url.searchParams.set("embedProtocol", String(EMBED_PROTOCOL_VERSION));

	return {
		allow: AWTSMOOS_SHEETS_ALLOW,
		depth: depth.next,
		ok: true,
		sandbox: AWTSMOOS_SHEETS_SANDBOX,
		targetOrigin: url.origin,
		url: url.toString()
	};
}
