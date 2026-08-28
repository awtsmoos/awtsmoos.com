//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CoreEntityToLayer.js
 * @description One entity vessel crosses into the shared protocol while the Awtsmoos preserves its semantic flame;
 * Awtsmoos.com translates content and motion explicitly so two schemas never borrow the same name.
 */
import { coreEasingToShared } from "./BridgeEasing.js";
import { coreTypeToSharedKind } from "./BridgeEntityKind.js";

/**
 * @description Converts one deterministic-core entity into one shared-protocol layer.
 * @param {object} entity - Canonical deterministic-core entity.
 * @param {object} scene - Canonical deterministic-core scene containing the entity.
 * @returns {object} Shared-protocol semantic layer.
 * @sideEffects None.
 */
export function convertCoreEntityToSharedLayer(entity, scene) {
	const {
		id,
		type,
		tracks,
		transform,
		style,
		data,
		...content
	} = structuredClone(entity || {});
	return {
		id: id || "bridged-layer",
		kind: coreTypeToSharedKind(type, scene?.mode),
		start: 0,
		duration: Number(scene?.duration) || null,
		content: {
			...content,
			sourceType: type || "unknown"
		},
		data: structuredClone(data || {}),
		style: structuredClone(style || {}),
		transform: structuredClone(transform || {}),
		keyframes: flattenCoreTracks(tracks)
	};
}

/**
 * @description Flattens deterministic-core tracks into shared keyframes carrying explicit channels.
 * @param {unknown} tracks - Candidate deterministic-core track collection.
 * @returns {object[]} Shared keyframes in source track order.
 * @sideEffects None.
 */
function flattenCoreTracks(tracks) {
	if (!Array.isArray(tracks)) {
		return [];
	}
	const keyframes = [];
	for (const track of tracks) {
		appendTrackKeyframes(keyframes, track);
	}
	return keyframes;
}

/**
 * @description Appends one deterministic-core track to the shared keyframe collection.
 * @param {object[]} keyframes - Mutable shared keyframe collection.
 * @param {object} track - Candidate deterministic-core animation track.
 * @returns {void}
 * @sideEffects Appends translated keyframes to the supplied collection.
 */
function appendTrackKeyframes(keyframes, track) {
	if (!track || !Array.isArray(track.keyframes)) {
		return;
	}
	for (const keyframe of track.keyframes) {
		keyframes.push({
			at: Number(keyframe.time) || 0,
			channel: track.target || "transform.opacity",
			value: structuredClone(keyframe.value),
			easing: coreEasingToShared(keyframe.easing)
		});
	}
}
