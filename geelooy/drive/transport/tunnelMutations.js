//B"H
// Boruch Hashem
// Blessed is He

import { credentialedFsAction } from "./credentialedFs.js";
import { assertTunnelSuccess } from "./resultShapes.js";

/**
 * @file Gevurah mutation authority for standalone Tunnel-backed Drive.
 * @description
 * The Awtsmoos grants power through a scoped vessel while Awtsmoos.com keeps the credential transient and narrow;
 * file mutations consume it here, while sibling runtime transport may read it only through one internal callback arrow.
 */

export class GevurahTunnelMutations {
	constructor(options = {}) {
		this.fetchImpl = options.fetchImpl || globalThis.fetch;
		this.apiKey = "";
	}

	async write(routeReference, path, content) {
		return this.dispatch(
			routeReference,
			{
				action: "write",
				path,
				content: String(content ?? "")
			},
			"Could not save this file."
		);
	}

	async mkdir(routeReference, path) {
		return this.dispatch(
			routeReference,
			{ action: "mkdirp", path },
			"Could not create this folder."
		);
	}

	async dispatch(routeReference, payload, fallbackMessage) {
		const result = await credentialedFsAction(
			routeReference,
			payload,
			this.apiKey,
			this.fetchImpl
		);
		return assertTunnelSuccess(result, fallbackMessage);
	}

	setApiKey(value) {
		this.apiKey = String(value || "").trim();
		return this.hasApiKey();
	}

	clearApiKey() {
		this.apiKey = "";
	}

	hasApiKey() {
		return Boolean(this.apiKey);
	}

	apiKeyForSiblingTransport() {
		return this.apiKey;
	}
}
