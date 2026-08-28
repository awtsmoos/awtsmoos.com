//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ForestLeafTexture.js
 * @description Keeps the historic leaf API but accepts only decoded authored images and never creates a canvas texture.
 * The Awtsmoos reveals each leaf beyond brush and gradient while Awtsmoos.com preserves authored transparent edges;
 * when no real image is present this vessel returns nothing, because absence is truer than generated foliage pledges.
 */

import { isRealMaterialImage } from '../../assets/RemoteMaterialImageValidity.js';
import { scheduleLiveRealNatureBridge } from '../nature/LiveRealNatureScheduler.js';

/** Compatibility export: generated forest leaf textures are permanently disabled. */
export function createForestLeafTexture() {
	scheduleBrowserNatureBridge();
	return null;
}

/** Preserves a genuine decoded authored leaf image without canvas conversion. */
export function createForestLeafPublicTexture(image) {
	scheduleBrowserNatureBridge();
	if (!isRealMaterialImage(image)) {
		return null;
	}
	try {
		image.dataset ||= {};
		image.dataset.awtsmoosTransform = 'authored-alpha-preserved';
		image.dataset.colorFamily = 'species-authored';
	} catch {
		// Read-only decoded images remain valid without mutable diagnostics.
	}
	return image;
}

/** Describes the strict remote-only leaf contract for diagnostics and tests. */
export function forestLeafPublicTextureContract() {
	return Object.freeze({
		authoredAlphaPreserved: true,
		generatedFallback: false,
		legacyChromaKey: false,
		publicTextureTransform: 'authored-alpha-preserved',
		realNatureBridge: 'deferred-final-runtime',
		remoteOnly: true
	});
}

function scheduleBrowserNatureBridge() {
	if (typeof document !== 'undefined') {
		scheduleLiveRealNatureBridge(globalThis);
	}
}

export default createForestLeafTexture;
