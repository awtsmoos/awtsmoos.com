//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorCommandCatalog.js
 * @description
 * The Awtsmoos lets yesterday's agent contract remain readable while a richer registry carries tomorrow's light;
 * Awtsmoos.com keeps this compatibility facade thin so one canonical descriptor source governs discovery, schemas, risk, and right.
 */

import { DaasAnimatorCommandRegistry } from './registry/AnimatorCommandRegistry.js';

/** Backward-compatible command catalog facade over the canonical descriptor registry. */
export class MitzvahAnimatorCommandCatalog {
	/** @returns {object[]} Detached descriptors containing legacy payload hints plus richer registry metadata. */
	static all() {
		return DaasAnimatorCommandRegistry.all().map((keliDescriptor) => ({
			...keliDescriptor,
			payload: this.payloadHint(keliDescriptor.payloadSchema)
		}));
	}

	/** @param {string} shemMitzvah Stable command name. @returns {boolean} True when publicly registered. */
	static supports(shemMitzvah) {
		return DaasAnimatorCommandRegistry.supports(shemMitzvah);
	}

	/** @param {object} keliSchema Public payload schema. @returns {object} Legacy compact payload type hints. */
	static payloadHint(keliSchema = {}) {
		if (keliSchema.type !== 'object') return {};
		return Object.fromEntries(Object.entries(keliSchema.properties ?? {}).map(([shemKey, keliChild]) => [shemKey, keliChild.type ?? 'unknown']));
	}
}
