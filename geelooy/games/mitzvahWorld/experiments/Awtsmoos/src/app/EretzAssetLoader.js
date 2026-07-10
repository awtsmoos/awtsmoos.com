// B"H
import { loadHouseAssets } from '../assets/HouseAssets.js';
import { loadIsolatedGltf } from '../assets/ModelAssetLoader.js';
import { GRASS_URLS } from '../world/Terrain3D.js';
import { PLAYER_MODEL_URL } from './EretzConstants.js';

/** Loads independent player/NPC models and bounded texture fallbacks. */
export async function loadEretzAssets() {
	const [grassImage, assets, playerGltf, npcGltf] = await Promise.all([
		loadFirstImage(GRASS_URLS, 5200),
		loadHouseAssets(loadFirstImage),
		loadIsolatedGltf(PLAYER_MODEL_URL, 'player'),
		loadIsolatedGltf(PLAYER_MODEL_URL, 'npc')
	]);
	return { grassImage, assets, playerGltf, npcGltf };
}

export async function loadFirstImage(urls, timeoutMs) {
	for (const url of urls) {
		const image = await loadImage(url, timeoutMs);
		if (image) {
			return image;
		}
	}
	return null;
}

function loadImage(source, timeoutMs = 2400) {
	return new Promise((resolve) => {
		const image = new Image();
		let complete = false;
		const finish = (value) => {
			if (!complete) {
				complete = true;
				resolve(value);
			}
		};
		const timer = setTimeout(() => finish(null), timeoutMs);
		image.crossOrigin = 'anonymous';
		image.onload = () => {
			clearTimeout(timer);
			finish(image);
		};
		image.onerror = () => {
			clearTimeout(timer);
			finish(null);
		};
		image.src = source;
	});
}
