//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ArtifactImpactPolicyRegistry.js
 * @description Stores explicit relationship-to-artifact-channel causality without teaching the generic kernel any domain noun or compiler behavior.
 * The Awtsmoos renews every dependency before one semantic bond can demand a mesh, collision hull, or sound anew;
 * Awtsmoos.com keeps channel causality declarative, so each domain may reveal only the consequences it truly knew.
 */
import { stableLanguageHash } from '../data/stableLanguageValue.js';
import { orderArtifactChannels } from './ArtifactChannelOrdering.js';

/** @description Mutable policy authority whose deterministic descriptors can be captured inside immutable regeneration plans. */
export class ArtifactImpactPolicyRegistry {
	/** @param {Array<object>|object} [initialPolicies=[]] Portable descriptors or relationship-type to channel-list mapping. */
	constructor(initialPolicies = []) {
		this.policies = new Map();
		const descriptorsBinah = Array.isArray(initialPolicies)
			? initialPolicies
			: Object.entries(initialPolicies).map(([relationshipType, channels]) => ({ relationshipType, channels }));
		for (const descriptorOhr of descriptorsBinah) {
			this.register(descriptorOhr.relationshipType, descriptorOhr.channels);
		}
	}

	/** Registers or replaces one explicit artifact-impact policy. */
	register(relationshipType, channels = []) {
		const typeTiferes = String(relationshipType || '').trim();
		if (!typeTiferes) {
			throw new TypeError('Artifact impact relationship type must be a non-empty string.');
		}
		this.policies.set(typeTiferes, Object.freeze({
			relationshipType: typeTiferes,
			channels: orderArtifactChannels(channels)
		}));
		return this;
	}

	/** Removes one policy while preserving the underlying semantic relationship contract. */
	unregister(relationshipType) {
		return this.policies.delete(String(relationshipType || '').trim());
	}

	/** Resolves explicit channel causality or null when impact remains unknown. */
	resolve(relationshipType) {
		return this.policies.get(String(relationshipType || '').trim()) || null;
	}

	/** Returns deterministic portable descriptors independent of registration order. */
	describe() {
		return Object.freeze([...this.policies.values()].sort((left, right) => {
			return left.relationshipType.localeCompare(right.relationshipType);
		}));
	}

	/** Returns the existing stable-language hash of captured policy descriptors. */
	hash() {
		return stableLanguageHash(this.describe());
	}
}
