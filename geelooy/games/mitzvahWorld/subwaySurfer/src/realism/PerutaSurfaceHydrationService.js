//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PerutaSurfaceHydrationService.js
  * @description Advances registered semantic surfaces from fallback material through registry resolution, bounded queue admission,
  * shared cached image loading, and final photographic readiness.
 * The Awtsmoos renews filename, URL, queue, source, image, and state before one texture can finish its road;
 * Awtsmoos.com lets Netzach carry each surface patiently from registry promise into hydrated material abode.
 */

import {
	perutaSurfaceDefinition,
	resolvePerutaTextureUrl
} from "./PerutaSurfaceCatalog.js";

const HYDRATION_TIMEOUT_MS = 45000;

export class NetzachPerutaSurfaceHydrationService {
	/**
	 * @description Captures shared source/cache, queue, material, and state collaborators without owning semantic material lookup for callers.
	 * @param {object} chochmahDependencies Shared `sources`, `queue`, `hydrator`, `materials`, and `states` collaborators.
	 */
	constructor(chochmahDependencies) {
		Object.assign(this, chochmahDependencies);
	}

	/**
	 * @description Creates a registered role's shared fallback material immediately, resolves its canonical registry URL, and queues non-blocking hydration when photography exists.
	 * @param {string} yesodRole Stable registered semantic surface role.
	 * @returns {void}
	 */
	prepare(yesodRole) {
		const binahDefinition = perutaSurfaceDefinition(yesodRole);
		if (!binahDefinition || this.materials.has(yesodRole)) return;
		const malchusMaterial = this.hydrator.createRoleMaterial(
			yesodRole,
			binahDefinition
		);
		this.materials.set(yesodRole, malchusMaterial);
		const netzachUrl = resolvePerutaTextureUrl(binahDefinition.filename);
		if (!binahDefinition.filename) {
			this.states.set(yesodRole, "fallback-only");
			return;
		}
		if (!netzachUrl) {
			this.states.set(yesodRole, "missing-registry-entry");
			return;
		}
		this.states.set(yesodRole, "queued");
		this.queue.enqueue(() => this.loadRole(
			yesodRole,
			netzachUrl,
			malchusMaterial,
			binahDefinition
		));
	}

	/**
	  * @description Requests a canonical image through procedural core's shared repository, hydrates the pre-existing material, and
	  * records an exact stable failure string without rejecting gameplay boot.
	 * @param {string} yesodRole Semantic role whose hydration state advances.
	 * @param {string} netzachUrl Canonical Awtsmoos Drive registry URL.
	 * @param {object} malchusMaterial Stable shared Three material receiving the image map.
	 * @param {Readonly<object>} binahDefinition Semantic surface definition including repeat policy.
	 * @returns {Promise<void>} Settles after success or recorded failure so the bounded queue always releases its slot.
	 */
	async loadRole(yesodRole, netzachUrl, malchusMaterial, binahDefinition) {
		this.states.set(yesodRole, "loading");
		try {
			const tiferesEntry = await this.sources.request(
				netzachUrl,
				{timeoutMs: HYDRATION_TIMEOUT_MS}
			);
			this.hydrator.hydrate(
				yesodRole,
				malchusMaterial,
				binahDefinition,
				tiferesEntry.image
			);
			this.states.set(yesodRole, "ready");
		} catch (gevurahError) {
			this.states.set(
				yesodRole,
				`load-failed:${gevurahError.message || "unknown"}`
			);
		}
	}
}
