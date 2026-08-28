//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SharedLayerToEntity.js
 * @description A shared semantic layer returns to the deterministic core while the Awtsmoos preserves its directed spark;
 * Awtsmoos.com translates content, motion, and coordinate covenant openly so compatibility never hides in the dark.
 */
import { sharedEasingToCore } from "./BridgeEasing.js";
import { sharedKindToCoreType } from "./BridgeEntityKind.js";
import { resolveCoreLayerTransform } from "./BridgeLayerTransform.js";
import { inferCoreSceneMode } from "./BridgeSceneMode.js";

/**
 * @description Converts one shared-protocol layer into one deterministic-core entity.
 * @param {object} layer - Canonical shared-protocol semantic layer.
 * @param {object} scene - Canonical shared-protocol scene containing the layer.
 * @returns {object} Deterministic-core entity.
 * @sideEffects None.
 */
export function convertSharedLayerToCoreEntity(layer, scene) {
	const type = sharedKindToCoreType(layer?.kind);
	return {
		id: layer?.id || "bridged-entity",
		type,
		...extractCoreContent(layer, type),
		style: structuredClone(layer?.style || {}),
		transform: resolveCoreLayerTransform(layer),
		tracks: groupSharedKeyframes(layer?.keyframes),
		metadata: {
			sourceKind: layer?.kind || "unknown",
			sourceSceneMode: inferCoreSceneMode(scene)
		}
	};
}

/**
 * @description Extracts renderer-neutral content fields appropriate for the resolved core type.
 * @param {object} layer - Shared semantic layer.
 * @param {string} type - Resolved deterministic-core entity type.
 * @returns {object} Core entity content fields.
 * @sideEffects None.
 */
function extractCoreContent(layer, type) {
	const content = structuredClone(layer?.content || {});
	const data = structuredClone(layer?.data || {});
	if (type === "text") {
		return {
			text: content.text || content.subtitle || layer?.id || ""
		};
	}
	if (type === "shape") {
		return {
			shape: content.shape === "rounded-rect" ? "rect" : content.shape || "path",
			data
		};
	}
	if (type === "infographic") {
		return { data };
	}
	if (type === "particle-emitter") {
		return {
			count: Number(data.count) || 42,
			data
		};
	}
	return {
		...content,
		data
	};
}

/**
 * @description Groups shared channel keyframes back into deterministic-core tracks.
 * @param {unknown} keyframes - Candidate shared keyframe collection.
 * @returns {object[]} Deterministic-core track collection.
 * @sideEffects None.
 */
function groupSharedKeyframes(keyframes) {
	if (!Array.isArray(keyframes)) {
		return [];
	}
	const groups = new Map();
	for (const keyframe of keyframes) {
		appendSharedKeyframe(groups, keyframe);
	}
	return Array.from(groups, function buildTrack([target, frames]) {
		return {
			target,
			keyframes: frames
		};
	});
}

/**
 * @description Appends one shared keyframe into the deterministic-core channel group it names.
 * @param {Map<string, object[]>} groups - Mutable channel-to-keyframe map.
 * @param {object} keyframe - Candidate shared-protocol keyframe.
 * @returns {void}
 * @sideEffects Mutates the supplied channel map.
 */
function appendSharedKeyframe(groups, keyframe) {
	const channel = keyframe?.channel || "transform.opacity";
	if (!groups.has(channel)) {
		groups.set(channel, []);
	}
	groups.get(channel).push({
		time: Number(keyframe?.at) || 0,
		value: structuredClone(keyframe?.value),
		easing: sharedEasingToCore(keyframe?.easing)
	});
}
