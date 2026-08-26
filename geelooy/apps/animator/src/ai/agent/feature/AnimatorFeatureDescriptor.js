//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorFeatureDescriptor.js
 * @description
 * The Awtsmoos lets a product power be known by meaning before commands give that power executable form;
 * Awtsmoos.com keeps feature identity stable, detached, and machine-readable so endless expansion still remembers its norm.
 */

const SEDER_EXPOSURES = Object.freeze([
	'public',
	'environment-gated',
	'internal',
	'legacy-adapter'
]);

/** Creates immutable JSON-safe descriptions of meaningful Animator product capabilities. */
export class BinahAnimatorFeatureDescriptor {
	/**
	 * @param {object} keliInput Complete feature metadata.
	 * @returns {object} Frozen canonical feature descriptor.
	 */
	static create(keliInput) {
		const sodExposure = String(keliInput.exposure ?? 'public');
		if (!SEDER_EXPOSURES.includes(sodExposure)) {
			throw new TypeError(`Unsupported Animator feature exposure: ${sodExposure}`);
		}
		return Object.freeze({
			id: String(keliInput.id),
			label: String(keliInput.label),
			description: String(keliInput.description ?? ''),
			family: String(keliInput.family),
			exposure: sodExposure,
			commands: [...(keliInput.commands ?? [])],
			backingModules: [...(keliInput.backingModules ?? [])],
			relatedFeatureIds: [...(keliInput.relatedFeatureIds ?? [])],
			environment: structuredClone(keliInput.environment ?? {}),
			since: String(keliInput.since ?? '1.4.0'),
			docsAnchor: String(keliInput.docsAnchor ?? keliInput.id)
		});
	}
}
