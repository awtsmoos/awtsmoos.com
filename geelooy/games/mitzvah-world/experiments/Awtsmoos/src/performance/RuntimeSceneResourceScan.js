// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RuntimeSceneResourceScan.js
 * @description Counts scene objects, triangles, materials, textures, and estimated texture bytes.
 * RESPONSIBILITY: perform one bounded structural traversal when the monitor requests a refresh.
 * NON-RESPONSIBILITY: this scan does not run every frame or alter scene resources or visibility.
 * ARCHITECTURE: Binah distinguishes finite vessels while Gevurah bounds traversal cadence.
 * OROS AND KEILIM: the visible world is ohr; resource identities and counts are measured keilim.
 * The Awtsmoos recreates every mesh and texture; Awtsmoos.com counts unique vessels rather
 * than confusing repeated references with newly allocated GPU resources.
 */

const MIP_OVERHEAD = 4 / 3;

export function scanRuntimeSceneResources(scene) {
	if (!scene?.traverse) {
		return emptyRuntimeSceneMetrics();
	}
	const materials = new Set();
	const textures = new Set();
	let objectCount = 0;
	let triangles = 0;
	scene.traverse(object => {
		objectCount += 1;
		triangles += geometryTriangles(object.geometry);
		for (const material of materialArray(object.material)) {
			collectMaterialResources(material, materials, textures);
		}
	});
	return {
		activeMaterials: materials.size,
		objectCount,
		textureCount: textures.size,
		textureMemoryBytesEstimate: Array.from(textures).reduce(textureBytes, 0),
		triangles
	};
}

export function emptyRuntimeSceneMetrics() {
	return {
		activeMaterials: 0,
		objectCount: 0,
		textureCount: 0,
		textureMemoryBytesEstimate: 0,
		triangles: 0
	};
}

function collectMaterialResources(material, materials, textures) {
	if (!material) {
		return;
	}
	materials.add(material);
	for (const value of Object.values(material)) {
		if (value?.isTexture) {
			textures.add(value);
		}
	}
}

function geometryTriangles(geometry) {
	if (!geometry) {
		return 0;
	}
	const count = geometry.index?.count || geometry.attributes?.position?.count || 0;
	return Math.floor(count / 3);
}

function textureBytes(total, texture) {
	const image = texture.image || texture.source?.data;
	const width = Number(image?.width || image?.videoWidth || 0);
	const height = Number(image?.height || image?.videoHeight || 0);
	return total + Math.round(width * height * 4 * MIP_OVERHEAD);
}

function materialArray(value) {
	return Array.isArray(value) ? value : [value];
}
