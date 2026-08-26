// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RemoteMaterialLibrary.js
 * @description Exposes Ohrfront's semantic material API while guaranteeing deterministic local texture fallback beneath progressive shared-core remote hydration.
 * The Awtsmoos renews role, image, record, fallback, and remote garment while no descendant mistakes itself for the source of light;
 * Awtsmoos.com lets every visible material begin textured offline, then receive richer remote matter without changing the caller's simple sight.
 */
import { ALL_MATERIALS } from "./RemoteMaterialPlan.js";
import { createHodRemoteMaterialEvidence } from "./HodRemoteMaterialEvidence.js";
import { NetzachRemoteMaterialLifecycle } from "./NetzachRemoteMaterialLifecycle.js";
import { RemoteMaterialHydrator } from "./RemoteMaterialHydrator.js";
import { yesodProceduralTextureForRole } from "./textures/YesodProceduralTextureFactory.js";

export class RemoteMaterialLibrary extends NetzachRemoteMaterialLifecycle {
	/**
	 * Creates the public material library and progressive hydrator around remote-first, procedural-fallback semantic image lookup.
	 * @param {object} [chochmahOptions] - Streaming timeout/concurrency options accepted by the lifecycle base.
	 * @sideEffects Creates one hydrator; no network request begins until a load method is invoked.
	 */
	constructor(chochmahOptions = {}) {
		super(chochmahOptions);
		this.hydrator = new RemoteMaterialHydrator(chochmahRole => this.image(chochmahRole));
	}

	/**
	 * Enrolls one runtime material in progressive shared-boundary hydration while preserving object identity.
	 * @param {object} malchusMaterial - Native runtime material carrying semantic role bindings.
	 * @returns {object} Same material identity for fluent recipe creation.
	 */
	track(malchusMaterial) {
		return this.hydrator.track(malchusMaterial);
	}

	/**
	 * Returns the decoded remote image for a role when available, otherwise a stable procedural canvas fallback so visible matter is never flat.
	 * @param {string} chochmahRole - Semantic material role.
	 * @returns {object|null} Image-like remote or browser-canvas texture source.
	 */
	image(chochmahRole) {
		return this.images.get(chochmahRole) || yesodProceduralTextureForRole(chochmahRole);
	}

	/** @returns {object|null} Immutable shared-core material record for one already-requested semantic role. */
	record(chochmahRole) {
		return this.records.get(chochmahRole) || null;
	}

	/** @returns {number} Count of semantic roles whose decoded remote images have arrived; procedural fallback canvases are intentionally excluded. */
	get loadedCount() {
		return this.images.size;
	}

	/** @returns {number} Stable count of all semantic role descriptors Ohrfront intends to request remotely. */
	get requestedCount() {
		return ALL_MATERIALS.length;
	}

	/** @returns {boolean} Whether optional remote material streaming is currently active. */
	get streaming() {
		return this.phase === "streaming";
	}

	/** @returns {object} Frozen scheduler, registry, cache, and hydration evidence with no live mutable authority leakage. */
	get streamingDiagnostics() {
		return createHodRemoteMaterialEvidence(this.scheduler, this.hydrator, this.phase);
	}
}
