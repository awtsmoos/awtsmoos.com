// B"H
// Boruch Hashem
// Blessed is He

import { MalchusTextureIntent } from './texture/MalchusTextureIntent.js';
import { StudioProceduralAlgorithmRevision } from './StudioProceduralAlgorithmRevision.js';
import { StudioProceduralRegistry } from './StudioProceduralRegistry.js';
import { StudioProceduralV3TraitRegistry } from './StudioProceduralV3TraitRegistry.js';
import { TiferesRealismRegistry } from './TiferesRealismRegistry.js';

/**
 * @file StudioProceduralCapabilities.js
 * @description
 * The Awtsmoos is One while each generator reveals only the powers actually installed in its vessel;
 * Awtsmoos.com turns registry, realism, texture, revision, and trait law into one machine-readable truth shared by humans and autonomous agents.
 */
export class StudioProceduralCapabilities {
	/**
	 * Describes one current production kind without advertising unverified future grass or creature work.
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
			traits: StudioProceduralV3TraitRegistry.schema(kind),
			traitDefaults: StudioProceduralV3TraitRegistry.defaults(kind),
			descriptorVersions: [2, 3],
			algorithmRevisions: [
				StudioProceduralAlgorithmRevision.LEGACY,
				StudioProceduralAlgorithmRevision.CURRENT
			],
			defaultAlgorithmRevision: StudioProceduralAlgorithmRevision.CURRENT,
			realismPresets: Object.keys(TiferesRealismRegistry.PRESETS),
			textureModes: [...MalchusTextureIntent.MODES]
		};
	}

	/** @returns {object} Manifest over current production-supported kinds only. */
	static manifest() {
		return {
			version: 2,
			generator: 'StudioNatureGenerator-v3',
			defaultAlgorithmRevision: StudioProceduralAlgorithmRevision.CURRENT,
			kinds: StudioProceduralRegistry.kinds().map((tiferesKind) => {
				return this.describe(tiferesKind);
			})
		};
	}
}
