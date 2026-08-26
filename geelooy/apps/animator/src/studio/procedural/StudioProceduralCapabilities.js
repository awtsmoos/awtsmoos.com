// B"H
// Boruch Hashem
// Blessed is He

import { StudioProceduralRegistry } from './StudioProceduralRegistry.js';

/**
 * @file StudioProceduralCapabilities.js
 * @description
 * The Awtsmoos is One while each generator reveals only the powers actually installed in its vessel;
 * Awtsmoos.com turns the existing registry into machine-readable capability truth for humans and autonomous agents without guessing.
 */
export class StudioProceduralCapabilities {
	/**
	 * Describes one currently registered production kind without advertising future grass or creature work.
	 * @param {string} kind Current registry kind.
	 * @returns {object} Serializable capability description.
	 */
	static describe(kind) {
		if (!StudioProceduralRegistry.supports(kind)) {
			throw new Error(`Unsupported procedural kind: ${kind}`);
		}
		return {
			kind,
			label: StudioProceduralRegistry.label(kind),
			params: StudioProceduralRegistry.schema(kind),
			defaults: StudioProceduralRegistry.defaults(kind),
			descriptorVersions: [2, 3],
			realismPresets: [
				'graphic',
				'balanced',
				'natural',
				'cinematic'
			],
			textureModes: [
				'procedural',
				'local',
				'remote',
				'mixed'
			]
		};
	}

	/** @returns {object} Manifest over current production-supported kinds only. */
	static manifest() {
		return {
			version: 1,
			generator: 'StudioNatureGenerator-v3',
			kinds: StudioProceduralRegistry.kinds().map((kind) => {
				return this.describe(kind);
			})
		};
	}
}
