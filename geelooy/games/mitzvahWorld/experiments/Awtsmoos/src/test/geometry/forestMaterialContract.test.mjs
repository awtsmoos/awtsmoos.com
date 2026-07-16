// B"H
import assert from 'node:assert/strict';
import test from 'node:test';
import { createMergedForestGeometry } from '../../world/trees/ForestGeometry.js';
import {
	createForestLeafPublicTexture,
	forestLeafPublicTextureContract
} from '../../world/trees/ForestLeafTexture.js';

test('forest uses a natural fallback and idle-keys public RGB leaves for a depth-writing MASK', async () => {
	const previousDocument = globalThis.document;
	const state = { gradientStops: [], preparedPixels: null };
	globalThis.document = fakeDocument(state);
	try {
		const forest = createMergedForestGeometry([]);
		const leafMaterial = forest.group.children[1].material;
		assert.equal(leafMaterial.alphaMode, 'MASK');
		assert.equal(leafMaterial.transparent, false);
		assert.equal(leafMaterial.depthWrite, true);
		assert.equal(leafMaterial.mapImageFallback, true);
		assert.equal(leafMaterial.mapImage.dataset.colorFamily, 'natural-green');
		assert.equal(leafMaterial.mapImage.dataset.replaceableByPublicTexture, 'true');
		assert.ok(state.gradientStops.some(([, color]) => color === 'rgba(62,122,54,0.98)'));
		assert.match(leafMaterial.textureUrl, /\/chai-forest-half\/textures\/leaves\/oak\.png$/);
		assert.ok(leafMaterial.texturePolicy.candidates.every(url => url.includes('/chai-forest-half/')));
		assert.equal(typeof leafMaterial.texturePolicy.hydrateMapImage, 'function');
		assert.equal(
			leafMaterial.texturePolicy.publicTextureTransform,
			'chai-leaf-background-to-alpha-mask'
		);
		assert.equal(forest.stats.transparentLeaves, false);
		assert.equal(forest.stats.depthWritingLeaves, true);
		assert.equal(forest.stats.proceduralLeafFallback, true);

		const publicImage = {
			complete: true,
			dataset: { publicUrl: 'https://materials.test/chai-oak.png' },
			naturalHeight: 1,
			naturalWidth: 2
		};
		assert.equal(
			createForestLeafPublicTexture(publicImage),
			null,
			'the first call schedules work and retains the visible fallback'
		);
		const prepared = await waitForPrepared(publicImage);
		assert.equal(prepared.dataset.publicUrl, publicImage.dataset.publicUrl);
		assert.equal(prepared.dataset.awtsmoosTransform, 'chai-leaf-background-to-alpha-mask');
		assert.equal(prepared.dataset.replaceableByPublicTexture, undefined);
		assert.equal(state.preparedPixels[3], 0, 'witnessed #486c55 background becomes transparent');
		assert.equal(state.preparedPixels[7], 255, 'distant leaf green remains opaque');
		assert.equal(createForestLeafPublicTexture(publicImage), prepared, 'the one-time conversion is cached');
		assert.equal(leafMaterial.texturePolicy.hydrateMapImage(publicImage), prepared);
		const contract = forestLeafPublicTextureContract();
		assert.deepEqual(contract.backgroundRgb, [72, 108, 85]);
		assert.equal(contract.preparation, 'idle-sliced-retain-fallback-until-ready');
		assert.equal(contract.pixelsPerIdleSlice, 16384);
	} finally {
		if (previousDocument === undefined) delete globalThis.document;
		else globalThis.document = previousDocument;
	}
});

async function waitForPrepared(image) {
	for (let attempt = 0; attempt < 100; attempt += 1) {
		await new Promise(resolve => setTimeout(resolve, 2));
		const prepared = createForestLeafPublicTexture(image);
		if (prepared) return prepared;
	}
	throw new Error('Timed out waiting for idle-sliced public leaf preparation.');
}

function fakeDocument(state) {
	return {
		createElement(name) {
			assert.equal(name, 'canvas');
			const context = {
				beginPath() {},
				bezierCurveTo() {},
				clearRect() {},
				drawImage() {},
				fill() {},
				getImageData() {
					return {
						data: new Uint8ClampedArray([
							72, 108, 85, 255,
							150, 190, 90, 255
						]),
						height: 1,
						width: 2
					};
				},
				moveTo() {},
				putImageData(pixels) {
					state.preparedPixels = pixels.data;
				},
				quadraticCurveTo() {},
				stroke() {},
				createRadialGradient() {
					return {
						addColorStop(position, color) {
							state.gradientStops.push([position, color]);
						}
					};
				}
			};
			return { dataset: {}, getContext: () => context, height: 0, width: 0 };
		}
	};
}
