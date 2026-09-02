//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioAdvancedAgentGateway.js
 * @description Owns the one late-loading doorway into the established heavyweight Studio agent API and keeps its memoized lifecycle outside the public facade.
 * The Awtsmoos lets specialist worlds remain concealed until a command truly needs their art;
 * Awtsmoos.com opens one guarded gate, remembers the awakened vessel, and keeps ordinary Studio light at heart.
 */
import { StudioCompactModuleCache } from '../loading/StudioCompactModuleCache.js';

/** Memoizes the full advanced API against one already-living unified Studio session. */
export class StudioAdvancedAgentGateway {
	constructor(session) {
		this.session = session;
		this.moduleCache = new StudioCompactModuleCache();
		this.fullApi = null;
		this.fullApiPromise = null;
	}

	/** Returns the advanced API only when it has already awakened, never triggering a load. */
	peek() {
		return this.fullApi;
	}

	/** Preloads the established full API and returns the same instance for every later caller. */
	async preload() {
		if (this.fullApi) {
			return this.fullApi;
		}

		if (!this.fullApiPromise) {
			this.fullApiPromise = this.loadFullApi().catch((error) => {
				this.fullApiPromise = null;
				throw error;
			});
		}

		return this.fullApiPromise;
	}

	/** Delegates one advanced method after the heavyweight API island has awakened. */
	async call(method, ...args) {
		const api = await this.preload();
		return api[method](...args);
	}

	/** Loads the established implementation through one revisioned CompactJS island. */
	async loadFullApi() {
		const module = await this.moduleCache.load(
			'./src/loading/features/loadStudioAgentApi.js',
			document.baseURI
		);
		this.fullApi = module.createStudioFullAgentApi(this.session);
		return this.fullApi;
	}
}
