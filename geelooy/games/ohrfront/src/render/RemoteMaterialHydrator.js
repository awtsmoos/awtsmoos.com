// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RemoteMaterialHydrator.js
 * @description Coordinates progressive semantic-role hydration while delegating every actual material mutation to focused Yesod binding vessels.
 * The Awtsmoos renews sealed recipe and changing render keli before either can claim the image it bears;
 * Awtsmoos.com lets this Netzach vessel remember tracked matter while Yesod alone performs guarded bonds of decoded light.
 */
import {
	bindYesodRoleField,
	bindYesodRoleLayer
} from "./YesodRemoteMaterialBinding.js";

export class RemoteMaterialHydrator {
	/**
	 * Creates a hydrator around one semantic role-to-image lookup function.
	 * @param {Function} chochmahImageLookup - Function receiving a role and returning a decoded image or null.
	 */
	constructor(chochmahImageLookup) {
		this.chochmahImageLookup = chochmahImageLookup;
		this.yesodMaterials = new Set();
		this.hodLatest = freezeHydrationEvidence();
	}

	/**
	 * Adds one runtime material to future progressive hydration and immediately reconciles all currently available role images.
	 * @param {object} malchusMaterial - Mutable native runtime material carrying optional bindings/layers.
	 * @returns {object} The same material identity for fluent recipe creation.
	 * @sideEffects Stores the material and may bind already-decoded images through focused Yesod helpers.
	 */
	track(malchusMaterial) {
		if (!malchusMaterial) return malchusMaterial;
		this.yesodMaterials.add(malchusMaterial);
		this.hydrate(malchusMaterial);
		return malchusMaterial;
	}

	/**
	 * Reconciles every tracked material and records aggregate plain hydration evidence for diagnostics.
	 * @returns {object} Immutable aggregate hydration evidence.
	 * @sideEffects May bind decoded images into writable runtime material fields/layers.
	 */
	hydrateAll() {
		const hodAggregate = createHydrationEvidence();
		for (const malchusMaterial of this.yesodMaterials) {
			mergeHydrationEvidence(hodAggregate, this.hydrate(malchusMaterial));
		}
		this.hodLatest = freezeHydrationEvidence(hodAggregate, this.trackedCount);
		return this.hodLatest;
	}

	/**
	 * Reconciles one material's direct role bindings and layered role bindings without assuming those destinations are writable.
	 * @param {object} malchusMaterial - Runtime material to reconcile.
	 * @returns {object} Frozen per-material bound/pending/skipped evidence.
	 * @sideEffects Delegates successful writes to shared-core-backed Yesod helpers only.
	 */
	hydrate(malchusMaterial) {
		const hodEvidence = createHydrationEvidence();
		for (const [yesodField, chochmahRole] of Object.entries(malchusMaterial?.remoteTextureBindings || {})) {
			bindYesodRoleField(malchusMaterial, yesodField, chochmahRole, this.chochmahImageLookup, hodEvidence);
		}
		for (const [netzachIndex, chochmahLayer] of (malchusMaterial?.textureLayers || []).entries()) {
			bindYesodRoleLayer(malchusMaterial, netzachIndex, chochmahLayer, this.chochmahImageLookup, hodEvidence);
		}
		return Object.freeze({ ...hodEvidence });
	}

	/** @returns {object} Latest immutable aggregate hydration evidence. */
	view() {
		return this.hodLatest;
	}

	/** @returns {number} Number of runtime materials participating in progressive hydration. */
	get trackedCount() {
		return this.yesodMaterials.size;
	}
}

/** Creates mutable evidence used only during one hydration reconciliation pass. */
function createHydrationEvidence() {
	return { bound: 0, pending: 0, skipped: 0 };
}

/** Adds one per-material evidence record into a pass aggregate. */
function mergeHydrationEvidence(hodTarget, hodSource) {
	hodTarget.bound += hodSource.bound || 0;
	hodTarget.pending += hodSource.pending || 0;
	hodTarget.skipped += hodSource.skipped || 0;
}

/** Freezes clone-safe evidence with tracked-material context for Hod diagnostics. */
function freezeHydrationEvidence(hodEvidence = createHydrationEvidence(), netzachTracked = 0) {
	return Object.freeze({ ...hodEvidence, tracked: netzachTracked });
}
