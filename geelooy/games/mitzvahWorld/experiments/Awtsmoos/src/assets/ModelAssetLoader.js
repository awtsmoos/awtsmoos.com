// B"H
import { loadTinyGltf } from '../../../light-three-gltf/tiny-gltf-loader.js';

/** Parses independent scenes while allowing both loads to share cached GLB bytes. */
export async function loadIsolatedGltf(url, label) {
	const isolatedUrl = withIsolation(url, label);
	const gltf = await loadTinyGltf(isolatedUrl);
	gltf.scene.name = `${label}_isolated_gltf_scene`;
	gltf.scene.userData.isolatedModelLoad = {
		label,
		originalUrl: url,
		isolatedUrl,
		sharedNetworkResource: stripFragment(isolatedUrl)
	};
	return gltf;
}

function withIsolation(url, label) {
	const parsed = new URL(url, location.href);
	parsed.hash = `AwtsmoosIsolatedGlb=${encodeURIComponent(label)}`;
	return parsed.href;
}

function stripFragment(url) {
	const parsed = new URL(url, location.href);
	parsed.hash = '';
	return parsed.href;
}
