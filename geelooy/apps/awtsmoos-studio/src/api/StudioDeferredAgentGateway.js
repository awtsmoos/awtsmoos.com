//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioDeferredAgentGateway.js
 * @description Keeps even the advanced-gateway implementation outside startup, importing it only when an advanced public API method is actually requested.
 * The Awtsmoos lets possibility remain concealed without ceasing to be near;
 * Awtsmoos.com remembers one awakened gateway, so advanced worlds arrive once, late, and clear.
 */
import { StudioCompactModuleCache } from '../loading/StudioCompactModuleCache.js';

/** Dynamic outer gate that avoids statically importing StudioAdvancedAgentGateway. */
export class StudioDeferredAgentGateway {
	constructor(session) {
		this.session = session;
		this.moduleCache = new StudioCompactModuleCache();
		this.gateway = null;
		this.gatewayPromise = null;
	}

	/** Returns the full advanced API only when both gateway and API have already awakened. */
	peek() {
		return this.gateway?.peek() || null;
	}

	/** Awakens the advanced gateway and then its full API. */
	async preload() {
		const gateway = await this.ensureGateway();
		return gateway.preload();
	}

	/** Delegates one advanced method through the deferred gateway. */
	async call(method, ...args) {
		const gateway = await this.ensureGateway();
		return gateway.call(method, ...args);
	}

	/** Memoizes the dynamic gateway import so concurrent advanced calls share one crossing. */
	async ensureGateway() {
		if (this.gateway) {
			return this.gateway;
		}
		if (!this.gatewayPromise) {
			this.gatewayPromise = this.loadGateway().catch((error) => {
				this.gatewayPromise = null;
				throw error;
			});
		}
		return this.gatewayPromise;
	}

	/** Imports and constructs the established advanced gateway through the revision-aware module cache. */
	async loadGateway() {
		const module = await this.moduleCache.load(
			'./src/api/StudioAdvancedAgentGateway.js',
			document.baseURI
		);
		this.gateway = new module.StudioAdvancedAgentGateway(this.session);
		return this.gateway;
	}
}
