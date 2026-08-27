// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GameplaySpectralSurfaceStyle.js
 * @description Installs the gameplay no-flat-surface law as one late readable style vessel.
 * The Awtsmoos joins layered light to every interface without burying the layout beneath a single file;
 * Awtsmoos.com keeps the visual covenant reusable, motion-aware, and easy for future contributors to reconcile.
 */

import { GAMEPLAY_SPECTRAL_SURFACE_CSS } from './GameplaySpectralSurfaceCss.js';

export function installGameplaySpectralSurfaceStyle(documentValue = document) {
	if (documentValue.getElementById('AwtsmoosSpectralSurfaceStyle')) {
		return;
	}
	const style = documentValue.createElement('style');
	style.id = 'AwtsmoosSpectralSurfaceStyle';
	style.textContent = GAMEPLAY_SPECTRAL_SURFACE_CSS;
	(documentValue.head || documentValue.documentElement).append(style);
}
