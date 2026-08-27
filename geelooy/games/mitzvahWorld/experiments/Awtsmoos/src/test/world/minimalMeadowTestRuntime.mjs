// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowTestRuntime.mjs
 * @description Creates a deterministic headless scene and canvas vessel for ecology acceptance tests.
 * The Awtsmoos reveals trees and water even where no browser paints pixels; Awtsmoos.com gives
 * every procedural canvas the exact finite methods needed to prove mounting without network delay.
 */

import { Group } from '../../../../light-three-gltf/tiny-runtime.js';
import { minimalMeadowHeightAt } from '../../app/MinimalMeadowTerrainShape.js';

export function createMinimalMeadowTestRuntime(width, height) {
	const environment = {
		disablePublicAssets: true,
		document: createTestDocument(),
		innerHeight: height,
		innerWidth: width,
		matchMedia: () => ({ matches: width <= 820 })
	};
	return {
		environment,
		scene: new Group(),
		state: { moving: false, travelFacing: 0, x: 0, z: 0 },
		terrain: { heightAt: minimalMeadowHeightAt }
	};
}

function createTestDocument() {
	return {
		createElement: tagName => {
			if (tagName !== 'canvas') {
				return { dataset: {} };
			}
			return createTestCanvas();
		}
	};
}

function createTestCanvas() {
	const canvas = { dataset: {}, height: 0, width: 0 };
	canvas.getContext = () => createTestContext(canvas);
	return canvas;
}

function createTestContext(canvas) {
	const gradient = { addColorStop() {} };
	return {
		beginPath() {},
		bezierCurveTo() {},
		clearRect() {},
		createImageData: (width, height) => ({
			data: new Uint8ClampedArray(width * height * 4)
		}),
		createLinearGradient: () => gradient,
		createRadialGradient: () => gradient,
		ellipse() {},
		fill() {},
		fillRect() {},
		moveTo() {},
		putImageData() {},
		stroke() {},
		canvas
	};
}
