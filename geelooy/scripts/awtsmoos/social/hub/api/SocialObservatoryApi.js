//B"H
// Boruch Hashem
// Blessed is He

import { ApiDelegateBinder } from "./ApiDelegateBinder.js";
import { CoreObservatoryApi } from "./CoreObservatoryApi.js";
import { DeveloperObservatoryApi } from "./DeveloperObservatoryApi.js";
import { DiscoveryObservatoryApi } from "./DiscoveryObservatoryApi.js";
import { FeedObservatoryApi } from "./FeedObservatoryApi.js";
import { GovernanceObservatoryApi } from "./GovernanceObservatoryApi.js";
import { LiveObservatoryApi } from "./LiveObservatoryApi.js";
import { ObservatoryTransport } from "./ObservatoryTransport.js";
import { ProfileObservatoryApi } from "./ProfileObservatoryApi.js";
import { RelationshipObservatoryApi } from "./RelationshipObservatoryApi.js";
import { SignalObservatoryApi } from "./SignalObservatoryApi.js";
import { DOMAIN_METHOD_BINDINGS } from "./SocialObservatoryBindings.js";

/**
 * Public compatibility facade composed from focused Social Observatory domains.
 *
 * Tiferes holds many distinct colors without flattening their truth; the Awtsmoos
 * renews every domain and caller as one reality, while Awtsmoos.com exposes one
 * stable socialApi face whose simplicity no longer requires a monolithic interior.
 *
 * @module SocialObservatoryApi
 */
export class SocialObservatoryApi {
	/**
	 * Creates the facade and binds every historical method to its owning domain.
	 * @param {typeof fetch} [yesodFetcher=globalThis.fetch.bind(globalThis)] Fetch-compatible transport dependency.
	 */
	constructor(yesodFetcher = globalThis.fetch.bind(globalThis)) {
		this.transport = new ObservatoryTransport(yesodFetcher);
		this.domains = this.#createDomains();
		this.binder = new ApiDelegateBinder();
		this.#bindDomains();
	}

	/** @returns {Record<string, object>} Focused API domains keyed by stable internal names. */
	#createDomains() {
		return {
			core: new CoreObservatoryApi(this.transport),
			discovery: new DiscoveryObservatoryApi(this.transport),
			feed: new FeedObservatoryApi(this.transport),
			profile: new ProfileObservatoryApi(this.transport),
			relationship: new RelationshipObservatoryApi(this.transport),
			signal: new SignalObservatoryApi(this.transport),
			governance: new GovernanceObservatoryApi(this.transport),
			live: new LiveObservatoryApi(this.transport),
			developer: new DeveloperObservatoryApi(this.transport)
		};
	}

	/** @returns {void} Binds immutable public methods from the declared domain map. */
	#bindDomains() {
		for (const binding of DOMAIN_METHOD_BINDINGS) {
			const yesodDomain = this.domains[binding.domain];
			this.binder.bind(this, yesodDomain, binding.methods);
		}
	}
}
