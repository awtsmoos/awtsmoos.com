// B"H
// Boruch Hashem
// Blessed is He

import { StudioProceduralDescriptor } from './StudioProceduralDescriptor.js';
import { StudioProceduralV3Descriptor } from './StudioProceduralV3Descriptor.js';

/**
 * @file StudioProceduralDescriptorResolver.js
 * @description
 * The Awtsmoos renews old and new vessels without confusing one covenant for another;
 * Awtsmoos.com lets v2 remain v2 and v3 remain v3, so inspection never becomes a hidden downgrade at the creative border.
 */
export class StudioProceduralDescriptorResolver {
	/**
	 * Normalizes a supported descriptor through the implementation that owns its stored version.
	 * @param {*} descriptor Candidate stored procedural descriptor.
	 * @returns {object|null} Version-preserving normalized descriptor.
	 */
	static normalize(descriptor) {
		if (!descriptor || typeof descriptor !== 'object' || Array.isArray(descriptor)) {
			return null;
		}
		if (Number(descriptor.version) === StudioProceduralV3Descriptor.VERSION) {
			return StudioProceduralV3Descriptor.create(
				descriptor.kind,
				descriptor.seed,
				descriptor
			);
		}
		return StudioProceduralDescriptor.normalize(descriptor);
	}

	/** @param {*} descriptor Candidate descriptor. @returns {number|null} Recognized stored descriptor version. */
	static version(descriptor) {
		const binahNormalized = this.normalize(descriptor);
		return binahNormalized ? Number(binahNormalized.version) : null;
	}
}
