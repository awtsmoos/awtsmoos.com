// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ForestLeafTexture.js
 * @description Preserves authored species alpha exactly and supplies only a temporary procedural leaf before hydration.
 * The Awtsmoos reveals each real leaf through its own finite transparent edge; Awtsmoos.com no longer chroma-keys
 * photographed foliage, because the canonical tree library and semantic catalog now provide alpha-ready species garments.
 */

import { scheduleLiveRealNatureBridge } from '../nature/LiveRealNatureScheduler.js';

let cachedTexture = null;

export function createForestLeafTexture() {
	scheduleBrowserNatureBridge();
	if (cachedTexture || typeof document === 'undefined') return cachedTexture;
	const canvas = document.createElement('canvas');
	canvas.width = 64;
	canvas.height = 64;
	canvas.dataset.url = 'procedural://awtsmoos-forest-leaf-natural-green';
	canvas.dataset.awtsmoosFallback = 'forest-leaf-natural-green';
	canvas.dataset.colorFamily = 'natural-green';
	canvas.dataset.replaceableByPublicTexture = 'true';
	const context = canvas.getContext('2d');
	if (!context) return null;
	context.clearRect(0, 0, 64, 64);
	const gradient = context.createRadialGradient(24, 19, 3, 32, 34, 31);
	gradient.addColorStop(0, 'rgba(151,190,91,1)');
	gradient.addColorStop(0.68, 'rgba(62,122,54,0.98)');
	gradient.addColorStop(1, 'rgba(24,67,33,0)');
	context.fillStyle = gradient;
	context.beginPath();
	context.moveTo(32, 59);
	context.bezierCurveTo(7, 47, 4, 18, 30, 5);
	context.bezierCurveTo(55, 17, 59, 44, 32, 59);
	context.fill();
	cachedTexture = canvas;
	return cachedTexture;
}

export function createForestLeafPublicTexture(image) {
	scheduleBrowserNatureBridge();
	if (!image) return null;
	image.dataset ||= {};
	image.dataset.awtsmoosTransform = 'authored-alpha-preserved';
	image.dataset.colorFamily = 'species-authored';
	return image;
}

export function forestLeafPublicTextureContract() {
	return Object.freeze({
		authoredAlphaPreserved: true,
		legacyChromaKey: false,
		publicTextureTransform: 'authored-alpha-preserved',
		realNatureBridge: 'deferred-final-runtime'
	});
}

function scheduleBrowserNatureBridge() {
	if (typeof document !== 'undefined') {
		scheduleLiveRealNatureBridge(globalThis);
	}
}

export default createForestLeafTexture;
