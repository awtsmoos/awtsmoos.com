//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldDependencyPolicyRegistry.js
 * @description Stores explicit data-driven causality policy separately from generic semantic relationship meaning.
 * The Awtsmoos renews every relation before a finite registry may declare what consequence flows;
 * Awtsmoos.com keeps causality explicit and portable, so no generic noun secretly decides what recompiles or grows.
 */
import { stableLanguageHash } from '../data/stableLanguageValue.js';
import { WORLD_DEPENDENCY_DIRECTIONS } from './WorldLineageProtocol.js';

const VALID_DIRECTIONS = new Set(Object.values(WORLD_DEPENDENCY_DIRECTIONS));

/** @description Mutable policy authority whose deterministic descriptors can be captured inside immutable world snapshots. */
export class WorldDependencyPolicyRegistry {
	/**
	 * @param {Array<object>|object} [initialPolicies=[]] Portable descriptors or type-to-direction mapping.
	 */
	constructor(initialPolicies = []) {
		this.policies = new Map();
		const descriptorsChesed = Array.isArray(initialPolicies)
			? initialPolicies
			: Object.entries(initialPolicies).map(([type, direction]) => ({ type, direction }));
		for (const descriptorOhr of descriptorsChesed) {
			this.register(descriptorOhr.type, descriptorOhr.direction);
		}
	}

	/** Registers or replaces one explicit relationship dependency policy. */
	register(type, direction) {
		const typeTiferes = String(type || '').trim();
		if (!typeTiferes) {
			throw new TypeError('World dependency policy type must be a non-empty string.');
		}
		if (!VALID_DIRECTIONS.has(direction)) {
			throw new RangeError(`Unsupported world dependency direction: ${String(direction)}`);
		}
		this.policies.set(typeTiferes, Object.freeze({ type: typeTiferes, direction }));
		return this;
	}

	/** Removes a relationship dependency policy without changing semantic relationship data. */
	unregister(type) {
		return this.policies.delete(String(type || '').trim());
	}

	/** Resolves one explicit dependency descriptor or null when the relationship remains semantic-only. */
	resolve(type) {
		return this.policies.get(String(type || '').trim()) || null;
	}

	/** Returns frozen deterministic policy descriptors sorted independently of registration order. */
	describe() {
		return Object.freeze([...this.policies.values()].sort((left, right) => {
			return left.type.localeCompare(right.type) || left.direction.localeCompare(right.direction);
		}));
	}

	/** Returns the existing stable-language hash of deterministic policy descriptors. */
	hash() {
		return stableLanguageHash(this.describe());
	}
}
