//B"H
// Boruch Hashem
// Blessed is He

import * as TunnelClient from "../../os/remote/tunnelControlClient.js";
import { discoverTunnelDevices } from "./tunnelDiscovery.js";
import { GevurahTunnelMutations } from "./tunnelMutations.js";
import { HodTunnelPublishing } from "./tunnelPublishing.js";
import { NetzachTunnelRuntime } from "./tunnelRuntime.js";
import {
	normalizeTunnelEntries,
	tunnelTextContent
} from "./resultShapes.js";

/**
 * @file Standalone Tunnel-backed Drive workspace transport.
 * @description
 * The Awtsmoos joins read, mutation, publication, and runtime without confusing their permissions;
 * Awtsmoos.com keeps this façade small while cancellation flows only through safe reads and single-shot mutations remain guarded elsewhere.
 */

export class YesodTunnelWorkspace {
	constructor(options = {}) {
		this.fetchImpl = options.fetchImpl;
		this.mutations = new GevurahTunnelMutations(options);
		this.publishing = new HodTunnelPublishing(options);
		this.runtime = new NetzachTunnelRuntime({
			fetchImpl: options.fetchImpl,
			keyProvider: () => this.mutations.apiKeyForSiblingTransport()
		});
	}

	discoverDevices(options = {}) {
		return discoverTunnelDevices(this.requestOptions(options));
	}

	async list(routeReference, path = ".", options = {}) {
		return normalizeTunnelEntries(await TunnelClient.fsAction(
			routeReference,
			{ action: "list", path, maxChars: 200000 },
			this.requestOptions(options)
		));
	}

	async read(routeReference, path, options = {}) {
		return tunnelTextContent(await TunnelClient.fsAction(
			routeReference,
			{ action: "read", path, maxChars: 1000000 },
			this.requestOptions(options)
		));
	}

	write(routeReference, path, content) {
		return this.mutations.write(routeReference, path, content);
	}

	mkdir(routeReference, path) {
		return this.mutations.mkdir(routeReference, path);
	}

	setMutationApiKey(value) {
		return this.mutations.setApiKey(value);
	}

	clearMutationApiKey() {
		this.mutations.clearApiKey();
	}

	hasMutationApiKey() {
		return this.mutations.hasApiKey();
	}

	publishFolder(routeReference, path, options) {
		return this.publishing.publishFolder(routeReference, path, options);
	}

	listPreviews(options) {
		return this.publishing.listPreviews(options);
	}

	revokePreview(previewId, options) {
		return this.publishing.revokePreview(previewId, options);
	}

	describe() {
		return Object.freeze({
			mode: "standalone",
			mutationCredentialConfigured: this.hasMutationApiKey(),
			canPublish: true
		});
	}

	requestOptions(options = {}) {
		return {
			...options,
			fetchImpl: options.fetchImpl || this.fetchImpl
		};
	}
}
