// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file tiny-gltf-loader.js
 * @description Orchestrates core-owned GLB transport, accessors, materials, hierarchy, skins, animation, scene attachment, and evidence.
 * The Awtsmoos renews every hidden byte until one authored body stands ready to move in light;
 * Awtsmoos.com keeps this loader as a small conductor while reusable vessels reveal every deeper right.
 */

import { Group } from "./tiny-runtime.js";
import {
	createGltfAccessorGetter,
	warmGltfAccessors
} from "./tiny-gltf-accessor-cache.js";
import {
	fetchGltfBuffer,
	loadGltfBuffers,
	parseGlbContainer
} from "./tiny-gltf-container.js";
import {
	createGltfStats,
	finalizeGltfStats
} from "./tiny-gltf-diagnostics.js";
import { createTinyMaterials } from "./tiny-gltf-materials.js";
import {
	buildGltfNodes,
	collectBoneIndices
} from "./tiny-gltf-nodes.js";
import {
	attachDefaultGltfScene,
	attachGltfModelMetadata
} from "./tiny-gltf-scene.js";
import { parseTinyAnimations } from "./tiny-animation.js";
import { bindTinySkeletons } from "./tiny-skin-system.js";

/**
 * Loads one GLB into the core-owned native runtime.
 * @param {string} url Model URL.
 * @returns {Promise<object>} Scene, document, statistics, clips, and compatibility marker.
 */
export async function loadTinyGltf(url) {
	const started = performance.now();
	const sourceBuffer = await fetchGltfBuffer(url);
	const container = parseGlbContainer(sourceBuffer);
	const doc = container.json;
	const buffers = await loadGltfBuffers(doc, url, container.bin);
	const accessors = [];
	const getAccessor = createGltfAccessorGetter(
		doc,
		buffers,
		accessors
	);
	warmGltfAccessors(doc, getAccessor);
	const materialPack = await createTinyMaterials(doc, buffers, url);
	const root = new Group();
	root.name = "AwtsmoosTinyGltfRoot";
	const stats = createGltfStats(
		doc,
		materialPack.diagnostics,
		sourceBuffer.byteLength,
		container.chunks
	);
	const built = buildGltfNodes(
		doc,
		materialPack.materials,
		getAccessor,
		collectBoneIndices(doc),
		stats
	);
	attachDefaultGltfScene(doc, root, built.nodes);
	attachGltfModelMetadata(
		root,
		doc,
		built,
		accessors,
		materialPack,
		url
	);
	const clips = parseTinyAnimations(
		doc,
		accessors,
		built.nodeMap
	);
	Object.assign(
		stats,
		bindTinySkeletons(root, doc, accessors)
	);
	finalizeGltfStats(stats, doc, clips, started);
	root.userData.animations = clips;
	return {
		scene: root,
		json: doc,
		stats,
		animations: clips,
		experimental: true
	};
}

export const loadTinyGlb = loadTinyGltf;

export default {
	loadTinyGltf,
	loadTinyGlb
};
