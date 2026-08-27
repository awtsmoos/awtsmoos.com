// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ForestLeafTexture.js
 * @description Preserves authored species alpha and delegates only opaque legacy cards to chroma key.
 * The Awtsmoos reveals each uploaded leaf through its own colors and transparent edge; Awtsmoos.com
 * refuses to repaint living species as vegetables while retaining a narrow bridge for old Chai cards.
 */

import {
	legacyForestLeafChromaKeyContract,
	prepareLegacyForestLeafTexture
} from './ForestLeafLegacyChromaKey.js';

let cachedTexture = null;
const AUTHORED_TREE_PATH = '/awtsmoos-nature/ilanos/trees/';

export function createForestLeafTexture() {
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
	context.strokeStyle = 'rgba(202,222,137,0.58)';
	context.lineWidth = 1.5;
	context.beginPath();
	context.moveTo(32, 58);
	context.quadraticCurveTo(29, 31, 31, 8);
	context.stroke();
	cachedTexture = canvas;
	return cachedTexture;
}

export function createForestLeafPublicTexture(image) {
	if (authoredTreeImage(image)) {
		image.dataset ||= {};
		image.dataset.awtsmoosTransform = 'authored-alpha-preserved';
		image.dataset.colorFamily = 'species-authored';
		return image;
	}
	return prepareLegacyForestLeafTexture(image);
}

export function forestLeafPublicTextureContract() {
	return Object.freeze({
		...legacyForestLeafChromaKeyContract(),
		authoredAlphaPreserved: true,
		authoredPath: AUTHORED_TREE_PATH,
		legacyTransformOnly: true
	});
}

function authoredTreeImage(image) {
	if (!image) return false;
	const source = image.dataset?.publicUrl || image.dataset?.url
		|| image.currentSrc || image.src || '';
	return String(source).includes(AUTHORED_TREE_PATH);
}

export default createForestLeafTexture;
