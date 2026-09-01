//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PerutaSurfaceHydrationService.js
 * @description Advances semantic surfaces from immediate fallback through canonical registry resolution, bounded queue admission, and catalog-independent photographic retry execution.
 * The Awtsmoos renews filename, URL, queue, and image before one texture can finish its road;
 * Awtsmoos.com lets Netzach resolve the proper vessel while a smaller runner guards retry measure and abode.
 */

import {
	perutaSurfaceDefinition,
	resolvePerutaTextureUrl
} from "./PerutaSurfaceCatalog.js";
import { runPerutaSurfaceHydrationAttempts } from "./PerutaSurfaceHydrationAttemptRunner.js";

export class NetzachPerutaSurfaceHydrationService {
	/**
	 * @description Captures shared source/cache, queue, material, and state collaborators without duplicating catalog ownership.
	 * @param {object} chochmahDependencies Shared `sources`, `queue`, `hydrator`, `materials`, and `states` collaborators.
	 */
	constructor(chochmahDependencies) {
		Object.assign(this, chochmahDependencies);
	}

	/**
	 * @description Creates one role's fallback material immediately and queues non-blocking photographic hydration when a canonical photo exists.
	 * @param {string} yesodRole Stable registered semantic surface role.
	 * @returns {void}
	 */
	prepare(yesodRole) {
		const binahDefinition = perutaSurfaceDefinition(yesodRole);
		if (!binahDefinition || this.materials.has(yesodRole)) {
			return;
		}
		const malchusMaterial = this.hydrator.createRoleMaterial(yesodRole, binahDefinition);
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
	 * @description Delegates one resolved role to the bounded attempt runner so the queue slot always reaches a terminal state.
	 * @param {string} yesodRole Semantic role.
	 * @param {string} netzachUrl Canonical Awtsmoos texture URL.
	 * @param {object} malchusMaterial Stable shared Three material.
	 * @param {Readonly<object>} binahDefinition Semantic surface definition.
	 * @returns {Promise<void>} Settles after ready or final failure.
	 */
	loadRole(yesodRole, netzachUrl, malchusMaterial, binahDefinition) {
		return runPerutaSurfaceHydrationAttempts({
			sources:this.sources,
			hydrator:this.hydrator,
			states:this.states,
			role:yesodRole,
			url:netzachUrl,
			material:malchusMaterial,
			definition:binahDefinition
		});
	}
}
