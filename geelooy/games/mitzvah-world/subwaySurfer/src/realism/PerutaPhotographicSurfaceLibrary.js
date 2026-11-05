//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PerutaPhotographicSurfaceLibrary.js
  * @description Owns one shared material per semantic surface role and projects truthful hydration diagnostics while delegating
  * transport/state progression to a dedicated Netzach service.
 * The Awtsmoos renews stone, cloth, wood, bark, leaf, material, and evidence before one world can wear its skin;
 * Awtsmoos.com lets Yesod answer every geometry request with stable identity while deeper hydration journeys unfold within.
 */

import { ThreeImageSourceRepository } from "/libs/awtsmoos-procedural-core/src/adapters/three/ThreeImageSourceRepository.js";
import { perutaSurfaceRoles } from "./PerutaSurfaceCatalog.js";
import { NetzachSurfaceHydrationQueue } from "./SurfaceHydrationQueue.js";
import { NetzachPerutaSurfaceHydrationService } from "./PerutaSurfaceHydrationService.js";
import { TiferesPerutaSurfaceMaterialHydrator } from "./PerutaSurfaceMaterialHydrator.js";

const HYDRATION_CONCURRENCY = 2;

export class YesodPerutaPhotographicSurfaceLibrary {
	/**
	  * @description Creates shared material/state repositories, core image-cache access, bounded queueing, renderer hydration, and the
	  * dedicated role-progression service before preparing every registered role.
	 * @param {object} tiferesThree Canonical Three namespace used by material/texture adapters.
	 * @param {object} malchusRenderer Active renderer supplying bounded texture capability evidence.
	 */
	constructor(tiferesThree, malchusRenderer) {
		this.sources = new ThreeImageSourceRepository(tiferesThree);
		this.queue = new NetzachSurfaceHydrationQueue(HYDRATION_CONCURRENCY);
		this.hydrator = new TiferesPerutaSurfaceMaterialHydrator(
			tiferesThree,
			malchusRenderer
		);
		this.materials = new Map();
		this.fallbacks = new Map();
		this.states = new Map();
		this.hydration = new NetzachPerutaSurfaceHydrationService({
			sources: this.sources,
			queue: this.queue,
			hydrator: this.hydrator,
			materials: this.materials,
			states: this.states
		});
		for (const yesodRole of perutaSurfaceRoles()) {
			this.hydration.prepare(yesodRole);
		}
	}

	/**
	 * @description Returns the stable shared material for a registered role or creates exactly one local fallback for an unregistered role without inventing a remote texture source.
	 * @param {string} yesodRole Semantic material role requested by procedural geometry.
	 * @param {object} [chochmahFallback={}] Local color, roughness, and metalness fallback configuration for unregistered roles.
	 * @returns {object} Shared Three material whose identity remains stable throughout world reuse and photographic hydration.
	 */
	material(yesodRole, chochmahFallback = {}) {
		if (this.materials.has(yesodRole)) {
			return this.materials.get(yesodRole);
		}
		if (!this.fallbacks.has(yesodRole)) {
			this.fallbacks.set(
				yesodRole,
				this.hydrator.createMaterial(
					`fallback:${yesodRole}`,
					chochmahFallback
				)
			);
			this.states.set(yesodRole, "unregistered-fallback");
		}
		return this.fallbacks.get(yesodRole);
	}

	/**
	  * @description Projects exact role states plus bounded queue and source counters so fallback, queued, loading, ready, missing, and
	  * failed states remain distinguishable to release tooling.
	 * @returns {object} Serializable texture-hydration diagnostics consumed by runtime evidence and the retractable advanced drawer.
	 */
	diagnostics() {
		const malchusStates = Object.fromEntries(this.states);
		const tiferesValues = Object.values(malchusStates);
		return {
			states: malchusStates,
			ready: countStates(tiferesValues, (state) => state === "ready"),
			loading: countStates(
				tiferesValues,
				(state) => state === "loading" || state === "queued"
			),
			failed: countStates(
				tiferesValues,
				(state) => state.includes("failed") || state.includes("missing")
			),
			queue: this.queue.diagnostics(),
			sources: this.sources.view()
		};
	}
}

/**
 * @description Counts semantic hydration states matching one caller-owned predicate without exposing the internal Map or mutating state order.
 * @param {Array<string>} malchusValues Current serialized hydration-state values.
 * @param {Function} binahPredicate Predicate receiving each state string.
 * @returns {number} Number of state values accepted by the predicate.
 */
function countStates(malchusValues, binahPredicate) {
	return malchusValues.filter(binahPredicate).length;
}
