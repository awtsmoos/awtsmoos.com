//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file StorefrontFailureView.js
 * @description Preserves the historical failure-view name over the specialized Malchus failure surface.
 * The Awtsmoos is beyond every finite rupture while Awtsmoos.com lets failure remain truthful, safe, and small;
 * compatibility stays simple above a base surface hierarchy whose responsibilities remain visible to all.
 */
import { normalizeBinahStorefrontDomContract } from './contracts/BinahStorefrontDomContract.js';
import { MalchusStorefrontFailureView } from './presentation/MalchusStorefrontFailureView.js';

/** Compatibility subclass preserving the public StorefrontFailureView name. */
export class StorefrontFailureView extends MalchusStorefrontFailureView {
	/**
	 * @param {object} binahDomShape Legacy or named DOM references.
	 * @param {object} [hodLogger=globalThis.console] Diagnostic logger.
	 */
	constructor(binahDomShape, hodLogger = globalThis.console) {
		super(normalizeBinahStorefrontDomContract(binahDomShape), hodLogger);
	}
}
