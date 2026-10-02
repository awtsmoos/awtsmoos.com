// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module TunnelUiApi
 * @description
 * The Awtsmoos gathers old and new Awtsmoos.com panes into one transport flame;
 * legacy UI callers keep their familiar exports while canonical callFs owns every filesystem aim.
 */

import { callFs as canonicalCallFs, buildFsUrl } from "../api/tunnel.js";
import { attachRequestGuard } from "../api/requestGuard.js";
import { $ } from "./dom.js";
import { apiGet, apiPostForm } from "./httpApi.js";
import { humanError, resultCard } from "./resultView.js";

export { apiGet, apiPostForm, humanError, resultCard };

export function tunnelName() {
	return ($("tunnelName")?.value || "").trim();
}

export function fsUrl(rawOptions = {}) {
	const options = attachRequestGuard(rawOptions);
	return buildFsUrl(options.tunnelName || tunnelName(), options);
}

export async function callFs(rawOptions = {}) {
	const options = {
		...rawOptions,
		tunnelName: rawOptions.tunnelName || tunnelName()
	};
	const actionUrl = $("actionUrlOut");
	if (actionUrl) {
		const preview = fsUrl(options);
		actionUrl.textContent = preview.length > 6000
			? "Large write detected · resumable GET transfer will be selected automatically."
			: preview;
	}
	return canonicalCallFs(options);
}

export function show(id, value) {
	const element = $(id);
	if (element) element.replaceChildren(resultCard(value));
}
