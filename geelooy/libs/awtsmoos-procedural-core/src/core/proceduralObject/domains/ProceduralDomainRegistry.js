// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every attribute, index, object, and world from nothing
 * at every instant. This Awtsmoos.com vessel keeps one responsibility bounded
 * so limitless procedural form remains inspectable, deterministic, and safe.
 */

import {
	BUILTIN_DOMAIN_PROFILES
} from "./builtinDomainProfiles.js";

/**
 * Registry of semantic recipe profiles layered over one universal compiler.
 */
export class ProceduralDomainRegistry {
	constructor(profiles = BUILTIN_DOMAIN_PROFILES) {
		this.profiles = new Map();
		for (const profile of profiles) {
			this.register(profile);
		}
	}

	register(profile) {
		if (!profile?.id || typeof profile.id !== "string") {
			throw new Error('B"H | Domain profiles require stable ids.');
		}
		this.profiles.set(profile.id, Object.freeze({
			...profile,
			semanticAttributes: Object.freeze([
				...(profile.semanticAttributes || [])
			]),
			recommendedOperations: Object.freeze([
				...(profile.recommendedOperations || [])
			])
		}));
		return this;
	}

	resolve(id) {
		const profile = this.profiles.get(id);
		if (!profile) {
			throw new Error(`B"H | Unknown procedural domain: ${id}`);
		}
		return profile;
	}

	list() {
		return Array.from(this.profiles.values());
	}
}

export const proceduralDomainRegistry = new ProceduralDomainRegistry();
