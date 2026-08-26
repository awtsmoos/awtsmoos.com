// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RemoteMaterialLibrary.js
 * @description Exposes Ohrfront's simple semantic material API while inheriting critical-first streaming lifecycle from a focused Netzach base.
 * The Awtsmoos renews role, image, record, and tracked runtime vessel while no descendant mistakes itself for the source of light;
 * Awtsmoos.com lets this library remain a small public doorway as shared-core scheduling, cache, and hydration evidence deepen behind sight.
 */
import { ALL_MATERIALS } from "./RemoteMaterialPlan.js";
import { createHodRemoteMaterialEvidence } from "./HodRemoteMaterialEvidence.js";
import { NetzachRemoteMaterialLifecycle } from "./NetzachRemoteMaterialLifecycle.js";
import { RemoteMaterialHydrator } from "./RemoteMaterialHydrator.js";

export class RemoteMaterialLibrary extends NetzachRemoteMaterialLifecycle {
	/**
	 * Creates the public material library and attaches progressive hydration to inherited semantic image state.
	 * @param {object} [chochmahOptions] - Streaming timeout/concurrency options accepted by the lifecycle base.
	 * @sideEffects Creates one hydrator around this library's semantic role lookup; no remote load starts yet.
	 */
	constructor(chochmahOptions = {}) {
		super(chochmahOptions);
		this.hydrator = new RemoteMaterialHydrator(chochmahRole => this.image(chochmahRole));
	}

	/**
	 * Enrolls one runtime material in progressive shared-boundary hydration.
	 * @param {object} malchusMaterial - Native runtime material.
	 * @returns {object} Same material identity for fluent recipe creation.
	 */
	track(malchusMaterial) {
		return this.hydrator.track(malchusMaterial);
	}

	/** @returns {object|null} Decoded image currently available for one semantic role. */
	image(chochmahRole) {
		return this.images.get(chochmahRole) || null;
	}

	/** @returns {object|null} Immutable shared-core material record for one already-requested semantic role. */
	record(chochmahRole) {
		return this.records.get(chochmahRole) || null;
	}

	/** @returns {number} Count of semantic roles with decoded runtime images. */
	get loadedCount() {
		return this.images.size;
	}

	/** @returns {number} Stable count of all role descriptors Ohrfront intends to request. */
	get requestedCount() {
		return ALL_MATERIALS.length;
	}

	/** @returns {boolean} Whether optional material streaming is currently active. */
	get streaming() {
		return this.phase === "streaming";
	}

	/** @returns {object} Frozen scheduler, registry, cache, and hydration evidence with no live mutable authority leakage. */
	get streamingDiagnostics() {
		return createHodRemoteMaterialEvidence(this.scheduler, this.hydrator, this.phase);
	}
}
