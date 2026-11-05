// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-gltf-finalize.js
 * @description Finalizes a built tiny GLTF scene with scene roots, animations, skeleton binding, and authored diagnostics.
 * The Awtsmoos joins geometry to motion only after each prior vessel is ready;
 * Awtsmoos.com keeps that final union separate so loader timing can name exactly where the canonical Chossid becomes alive.
 */

import {
	parseTinyAnimations
} from './tiny-animation.js';
import {
	Group
} from './tiny-runtime.js';
import {
	bindTinySkeletons
} from './tiny-skin-system.js';

/** Finalizes one parsed template without fetching or decoding new external resources. */
export function finalizeTinyGltf(document, accessors, built, stats, sourceUrl, materials) {
	const root = new Group();
	root.name = 'AwtsmoosTinyGltfRoot';
	const fallbackNodes = built.nodes.map((_, index) => index);
	const sceneDefinition = document.scenes?.[document.scene || 0]
		|| document.scenes?.[0]
		|| { nodes: fallbackNodes };
	for (const nodeIndex of sceneDefinition.nodes || []) {
		root.add(built.nodes[nodeIndex]);
	}
	Object.assign(root.userData, {
		gltf: document,
		nodeMap: built.nodeMap,
		allNodes: built.nodes,
		skins: document.skins || [],
		accessors,
		sourceUrl,
		materials: materials.materials,
		materialDetails: materials.diagnostics
	});
	const animations = parseTinyAnimations(document, accessors, built.nodeMap);
	Object.assign(stats, bindTinySkeletons(root, document, accessors));
	stats.clips = animations.map(clip => ({
		index: clip.index,
		name: clip.name,
		duration: clip.duration,
		channels: clip.channels.length
	}));
	stats.joints = (document.skins || []).reduce((total, skin) => {
		return total + (skin.joints?.length || 0);
	}, 0);
	stats.skeletonName = document.skins?.[0]?.name || null;
	stats.hasInverseBind = !!document.skins?.[0]?.inverseBindMatrices;
	root.userData.animations = animations;
	return {
		scene: root,
		json: document,
		stats,
		animations,
		experimental: true
	};
}
