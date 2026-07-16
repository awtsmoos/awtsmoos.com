// B"H
import assert from 'node:assert/strict';
import test from 'node:test';
import {
	hydrateSceneMaterialImages,
	progressivelyHydratePublicMaterials,
	SCENE_MATERIAL_HYDRATION_URL_LIMIT
} from '../../assets/PublicMaterialCache.js';

const previousImage = globalThis.Image;
const createdImages = [];

class ImmediateImage {
	constructor() {
		this.complete = false;
		this.dataset = {};
		this.naturalHeight = 0;
		this.naturalWidth = 0;
		createdImages.push(this);
	}

	get src() {
		return this.currentSrc || '';
	}

	set src(value) {
		this.currentSrc = value;
		if (!value) return;
		queueMicrotask(() => {
			this.complete = true;
			this.naturalHeight = 512;
			this.naturalWidth = 512;
			this.onload?.();
		});
	}
}

globalThis.Image = ImmediateImage;
test.after(() => {
	if (previousImage === undefined) delete globalThis.Image;
	else globalThis.Image = previousImage;
});

test('optional startup waits for scene references instead of preloading the catalog', async () => {
	const summary = await progressivelyHydratePublicMaterials();
	assert.equal(summary.requested, 0);
	assert.equal(summary.strategy, 'scene-referenced-max-two-new-urls-per-cadence');
	assert.equal(createdImages.length, 0);
});

test('one scene cadence starts at most two distinct URLs and safely transforms a procedural leaf live', async () => {
	const urls = ['base', 'leaf', 'mix', 'layer'].map(name => `https://materials.test/cadence-${name}.png`);
	const fallback = {
		complete: true,
		dataset: { replaceableByPublicTexture: 'true' },
		height: 64,
		width: 64
	};
	const transformedSources = [];
	const base = { mapImage: null, textureUrl: urls[0] };
	const leaf = {
		mapImage: fallback,
		mapImageFallback: true,
		texturePolicy: {
			proceduralFallbackActive: true,
			realMapImage: false,
			hydrateMapImage(image) {
				transformedSources.push(image);
				return {
					complete: true,
					dataset: { awtsmoosTransform: 'test-leaf-background-to-alpha-mask' },
					height: image.naturalHeight,
					source: image,
					width: image.naturalWidth
				};
			}
		},
		textureUrl: urls[1],
		userData: { AwtsmoosForestMaterial: { proceduralFallback: true, realMapImage: false } }
	};
	const mixed = { mapImage: completeImage(), mixImage: null, mixTextureUrl: urls[2], textureUrl: 'data:image/png;base64,AA==' };
	const layered = { textureLayers: [{ image: null, role: 'mud', url: urls[3] }] };
	const objects = [base, leaf, mixed, layered].map(material => ({ material, userData: {} }));
	const root = { traverse(callback) { for (const object of objects) callback(object); } };

	const first = hydrateSceneMaterialImages(root, { requestLimit: 99 });
	assert.equal(first.requestLimit, SCENE_MATERIAL_HYDRATION_URL_LIMIT);
	assert.equal(first.requested, 2);
	assert.deepEqual(first.requestedUrls, urls.slice(0, 2));
	assert.equal(base.mapImage, null);
	assert.equal(leaf.mapImage, fallback);
	await settleLoads();

	const second = hydrateSceneMaterialImages(root);
	assert.equal(second.requested, 2);
	assert.deepEqual(second.requestedUrls, urls.slice(2));
	assert.notEqual(base.mapImage, null);
	assert.notEqual(leaf.mapImage, fallback);
	assert.equal(leaf.mapImage.dataset.awtsmoosTransform, 'test-leaf-background-to-alpha-mask');
	assert.equal(leaf.mapImage.source, transformedSources[0]);
	assert.equal(transformedSources.length, 1);
	assert.equal(second.mapTransformsPending, 0);
	assert.equal(leaf.mapImageFallback, false);
	assert.equal(leaf.texturePolicy.proceduralFallbackActive, false);
	assert.equal(leaf.texturePolicy.realMapImage, true);
	assert.equal(leaf.userData.AwtsmoosForestMaterial.proceduralFallback, false);
	await settleLoads();

	const third = hydrateSceneMaterialImages(root);
	assert.equal(third.requested, 0);
	assert.notEqual(mixed.mixImage, null);
	assert.notEqual(layered.textureLayers[0].image, null);
	assert.equal(transformedSources.length, 1, 'the hydrated map is stable on later cadences');
	assert.equal(third.readyUrls, 4);
});


test('pending map transforms retain the procedural fallback until a later cadence', async () => {
	const url = 'https://materials.test/idle-leaf-transform.png';
	const fallback = {
		complete: true,
		dataset: { replaceableByPublicTexture: 'true' },
		height: 64,
		width: 64
	};
	const transformed = {
		complete: true,
		dataset: { awtsmoosTransform: 'idle-leaf-background-to-alpha-mask' },
		height: 512,
		width: 512
	};
	let transformReady = false;
	const material = {
		mapImage: fallback,
		mapImageFallback: true,
		texturePolicy: {
			proceduralFallbackActive: true,
			realMapImage: false,
			hydrateMapImage() {
				return transformReady ? transformed : null;
			}
		},
		textureUrl: url
	};
	const object = { material, userData: {} };
	const root = { traverse(callback) { callback(object); } };

	const first = hydrateSceneMaterialImages(root);
	assert.equal(first.requested, 1);
	await settleLoads();

	const pending = hydrateSceneMaterialImages(root);
	assert.equal(pending.requested, 0);
	assert.equal(pending.mapTransformsPending, 1);
	assert.equal(material.mapImage, fallback);
	assert.equal(material.mapImageFallback, true);
	assert.equal(material.texturePolicy.proceduralFallbackActive, true);

	transformReady = true;
	const completed = hydrateSceneMaterialImages(root);
	assert.equal(completed.mapImagesBound, 1);
	assert.equal(completed.mapTransformsPending, 0);
	assert.equal(completed.readyUrls, 1);
	assert.equal(material.mapImage, transformed);
	assert.equal(material.mapImageFallback, false);
	assert.equal(material.texturePolicy.proceduralFallbackActive, false);
});

function completeImage() {
	return { complete: true, naturalHeight: 1, naturalWidth: 1 };
}

function settleLoads() {
	return new Promise(resolve => setTimeout(resolve, 0));
}


