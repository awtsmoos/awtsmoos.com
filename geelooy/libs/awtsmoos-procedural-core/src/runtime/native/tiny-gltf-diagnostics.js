// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file tiny-gltf-diagnostics.js
 * @description Builds skin/accessor/clip loader evidence without burdening GLB orchestration.
 * The Awtsmoos renews every hidden joint and accessor while evidence remembers how the model was revealed;
 * Awtsmoos.com keeps diagnostics beside truth, not inside the parser, so future debugging stays clearly sealed.
 */

import { accessorSummary } from "./tiny-gltf-accessors.js";
import { summarizeAnimations } from "./tiny-animation.js";

/**
 * Creates initial GLTF loader statistics before hierarchy construction.
 * @param {object} doc GLTF document.
 * @param {object} materialDiagnostics Material evidence.
 * @param {number} bytes Source byte size.
 * @param {Array<object>} chunks GLB chunk evidence.
 * @returns {object} Initial statistics.
 */
export function createGltfStats(
	doc,
	materialDiagnostics,
	bytes,
	chunks
) {
	return {
		nodes: 0,
		meshes: 0,
		primitives: 0,
		materials: (doc.materials || []).length,
		images: (doc.images || []).length,
		textures: (doc.textures || []).length,
		animations: (doc.animations || []).length,
		skins: (doc.skins || []).length,
		skinnedNodes: 0,
		skinnedPrimitives: 0,
		bytes,
		chunks,
		skinDetails: skinDetails(doc),
		animationDetails: summarizeAnimations(doc),
		accessorDetails: skinAccessorDetails(doc),
		materialDetails: materialDiagnostics
	};
}

/**
 * Finalizes model, skeleton, clip, and load-time evidence.
 * @param {object} stats Mutable stats.
 * @param {object} doc GLTF document.
 * @param {Array<object>} clips Parsed clips.
 * @param {number} started Start timestamp.
 */
export function finalizeGltfStats(stats, doc, clips, started) {
	stats.joints = (doc.skins || []).reduce((count, skin) => {
		return count + (skin.joints?.length || 0);
	}, 0);
	stats.skeletonName = doc.skins?.[0]?.name || null;
	stats.hasInverseBind = Boolean(
		doc.skins?.[0]?.inverseBindMatrices
	);
	stats.clips = clips.map((clip) => ({
		index: clip.index,
		name: clip.name,
		duration: clip.duration,
		channels: clip.channels.length
	}));
	stats.ms = Math.round(performance.now() - started);
}

/** @returns {Array<object>} Compact skin evidence. */
function skinDetails(doc) {
	return (doc.skins || []).map((skin, index) => ({
		index,
		name: skin.name || null,
		joints: (skin.joints || []).length,
		skeleton: skin.skeleton ?? null,
		hasInverseBind: skin.inverseBindMatrices !== undefined,
		inverseBindAccessor: skin.inverseBindMatrices
	}));
}

/** @returns {Array<string>} Skin-related accessor evidence. */
function skinAccessorDetails(doc) {
	const details = [];
	for (const mesh of doc.meshes || []) {
		for (const primitive of mesh.primitives || []) {
			for (const [semantic, index] of Object.entries(
				primitive.attributes || {}
			)) {
				if (
					semantic !== "JOINTS_0"
					&& semantic !== "WEIGHTS_0"
				) {
					continue;
				}
				details.push(
					`${semantic}: ${accessorSummary(doc, index)}`
				);
			}
		}
	}
	return [...new Set(details)].slice(0, 24);
}
